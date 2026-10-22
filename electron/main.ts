import { app, BrowserWindow, ipcMain } from 'electron'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { Folder, Note, Store, Theme } from './types'

let mainWindow: BrowserWindow | null = null

function dataFile() {
  // electron-builder provides this for a portable executable. For an unpacked
  // portable folder, the executable's directory is the durable location.
  // Keeping data here means the folder can be moved without losing notes.
  const root = app.isPackaged
    ? (process.env.PORTABLE_EXECUTABLE_DIR || dirname(process.execPath))
    : app.getAppPath()
  return join(root, 'data', 'lilac.json')
}

function emptyStore(): Store {
  return { folders: [{ id: 'inbox', name: 'Notas', parentId: null }], notes: [], preferences: { theme: 'dark' } }
}

function loadStore(): Store {
  const file = dataFile()
  try {
    if (existsSync(file)) {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as Partial<Store>
      if (Array.isArray(parsed.folders) && Array.isArray(parsed.notes) && parsed.preferences && (parsed.preferences.theme === 'light' || parsed.preferences.theme === 'dark')) return parsed as Store
      throw new Error('Formato de almacenamiento no válido')
    }
  } catch { /* Fall back to a recoverable empty document if storage is malformed. */ }
  return emptyStore()
}

function saveStore(store: Store): Store {
  const file = dataFile()
  mkdirSync(dirname(file), { recursive: true })
  const temp = `${file}.tmp`
  writeFileSync(temp, JSON.stringify(store, null, 2), 'utf8')
  renameSync(temp, file)
  return store
}

function update(mutator: (store: Store) => void) {
  const store = loadStore()
  mutator(store)
  return saveStore(store)
}

function mustFolder(store: Store, id: string) {
  if (!store.folders.some(folder => folder.id === id)) throw new Error('Carpeta no encontrada')
}

function folderAndChildren(store: Store, id: string): string[] {
  const ids = [id]
  for (let i = 0; i < ids.length; i += 1) {
    store.folders.filter(folder => folder.parentId === ids[i]).forEach(folder => ids.push(folder.id))
  }
  return ids
}

function registerIpc() {
  ipcMain.handle('store:load', () => loadStore())
  ipcMain.handle('folder:create', (_event, name: string, parentId: string | null) => update(store => {
    if (parentId) mustFolder(store, parentId)
    const trimmed = name.trim()
    if (!trimmed) throw new Error('El nombre de la carpeta es obligatorio')
    store.folders.push({ id: randomUUID(), name: trimmed, parentId })
  }))
  ipcMain.handle('folder:rename', (_event, id: string, name: string) => update(store => {
    const folder = store.folders.find(item => item.id === id)
    const trimmed = name.trim()
    if (!folder || !trimmed) throw new Error('Carpeta no válida')
    folder.name = trimmed
  }))
  ipcMain.handle('folder:remove', (_event, id: string) => update(store => {
    const ids = folderAndChildren(store, id)
    store.folders = store.folders.filter(folder => !ids.includes(folder.id))
    store.notes = store.notes.filter(note => !ids.includes(note.folderId))
  }))
  ipcMain.handle('note:create', (_event, folderId: string, title: string) => update(store => {
    mustFolder(store, folderId)
    const now = new Date().toISOString()
    store.notes.push({ id: randomUUID(), folderId, title: title.trim() || 'Nota sin título', content: '', createdAt: now, updatedAt: now })
  }))
  ipcMain.handle('note:update', (_event, id: string, patch: Pick<Note, 'title' | 'content'>) => update(store => {
    const note = store.notes.find(item => item.id === id)
    if (!note) throw new Error('Nota no encontrada')
    note.title = patch.title.trim() || 'Nota sin título'
    note.content = patch.content
    note.updatedAt = new Date().toISOString()
  }))
  ipcMain.handle('note:remove', (_event, id: string) => update(store => {
    store.notes = store.notes.filter(note => note.id !== id)
  }))
  ipcMain.handle('preferences:theme', (_event, theme: Theme) => update(store => { store.preferences.theme = theme }))
}

function iconPath() {
  return app.isPackaged
    ? join(__dirname, '../dist/lilac_icon.ico')
    : join(app.getAppPath(), 'public', 'lilac_icon.ico')
}

async function createWindow() {
  mainWindow = new BrowserWindow({ width: 1180, height: 760, minWidth: 760, minHeight: 520, backgroundColor: '#1e1a25', icon: iconPath(), webPreferences: { preload: join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false } })
  if (process.env.VITE_DEV_SERVER_URL) await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  else await mainWindow.loadFile(join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => { registerIpc(); createWindow() })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() })
