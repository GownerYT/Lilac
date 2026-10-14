/// <reference types="vite/client" />

type Theme = 'light' | 'dark'
interface Folder { id: string; name: string; parentId: string | null }
interface Note { id: string; folderId: string; title: string; content: string; createdAt: string; updatedAt: string }
interface Store { folders: Folder[]; notes: Note[]; preferences: { theme: Theme } }

interface Window {
  lilac: {
    load: () => Promise<Store>
    createFolder: (name: string, parentId: string | null) => Promise<Store>
    renameFolder: (id: string, name: string) => Promise<Store>
    removeFolder: (id: string) => Promise<Store>
    createNote: (folderId: string, title: string) => Promise<Store>
    updateNote: (id: string, title: string, content: string) => Promise<Store>
    removeNote: (id: string) => Promise<Store>
    setTheme: (theme: Theme) => Promise<Store>
  }
}
