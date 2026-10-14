const STORAGE_KEY = 'lilac-browser-store'

function emptyStore(): Store {
  return {
    folders: [{ id: 'inbox', name: 'Notas', parentId: null }],
    notes: [],
    preferences: { theme: 'light' }
  }
}

function read(): Store {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    if (!value) return emptyStore()
    const store = JSON.parse(value) as Partial<Store>
    if (Array.isArray(store.folders) && Array.isArray(store.notes) && store.preferences) return store as Store
  } catch { /* Use a fresh store if browser storage is unavailable or malformed. */ }
  return emptyStore()
}

function write(store: Store): Store {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  return store
}

function update(mutator: (store: Store) => void): Promise<Store> {
  const store = read()
  mutator(store)
  return Promise.resolve(write(store))
}

export const browserStore: Window['lilac'] = {
  load: () => Promise.resolve(read()),
  createFolder: (name, parentId) => update(store => {
    if (parentId && !store.folders.some(folder => folder.id === parentId)) throw new Error('Carpeta no encontrada')
    const trimmed = name.trim()
    if (!trimmed) throw new Error('El nombre de la carpeta es obligatorio')
    store.folders.push({ id: crypto.randomUUID(), name: trimmed, parentId })
  }),
  renameFolder: (id, name) => update(store => {
    const folder = store.folders.find(item => item.id === id)
    const trimmed = name.trim()
    if (!folder || !trimmed) throw new Error('Carpeta no válida')
    folder.name = trimmed
  }),
  removeFolder: id => update(store => {
    const removed = new Set([id])
    for (let index = 0; index < store.folders.length; index += 1) {
      const folder = store.folders[index]
      if (folder.parentId && removed.has(folder.parentId)) removed.add(folder.id)
    }
    store.folders = store.folders.filter(folder => !removed.has(folder.id))
    store.notes = store.notes.filter(note => !removed.has(note.folderId))
  }),
  createNote: (folderId, title) => update(store => {
    if (!store.folders.some(folder => folder.id === folderId)) throw new Error('Carpeta no encontrada')
    const now = new Date().toISOString()
    store.notes.push({ id: crypto.randomUUID(), folderId, title: title.trim() || 'Nueva nota', content: '', createdAt: now, updatedAt: now })
  }),
  updateNote: (id, title, content) => update(store => {
    const note = store.notes.find(item => item.id === id)
    if (!note) throw new Error('Nota no encontrada')
    note.title = title.trim() || 'Nueva nota'
    note.content = content
    note.updatedAt = new Date().toISOString()
  }),
  removeNote: id => update(store => { store.notes = store.notes.filter(note => note.id !== id) }),
  setTheme: theme => update(store => { store.preferences.theme = theme })
}
