export type Theme = 'light' | 'dark'

export interface Folder {
  id: string
  name: string
  parentId: string | null
}

export interface Note {
  id: string
  folderId: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Store {
  folders: Folder[]
  notes: Note[]
  preferences: { theme: Theme }
}
