import { contextBridge, ipcRenderer } from 'electron'
import type { Theme } from './types'

contextBridge.exposeInMainWorld('lilac', {
  load: () => ipcRenderer.invoke('store:load'),
  createFolder: (name: string, parentId: string | null) => ipcRenderer.invoke('folder:create', name, parentId),
  renameFolder: (id: string, name: string) => ipcRenderer.invoke('folder:rename', id, name),
  removeFolder: (id: string) => ipcRenderer.invoke('folder:remove', id),
  createNote: (folderId: string, title: string) => ipcRenderer.invoke('note:create', folderId, title),
  updateNote: (id: string, title: string, content: string) => ipcRenderer.invoke('note:update', id, { title, content }),
  removeNote: (id: string) => ipcRenderer.invoke('note:remove', id),
  setTheme: (theme: Theme) => ipcRenderer.invoke('preferences:theme', theme)
})
