import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactElement } from 'react'
import { browserStore } from './browserStore'

// Vite can render the interface in a normal browser during development. The
// Electron preload bridge exists only inside the desktop shell, so use a local
// browser store there without weakening the production Electron boundary.
const storeApi = window.lilac ?? browserStore

function FolderTree({ folders, selectedId, onSelect, onAddNote, onAddChild, onRename, onRemove }: {
  folders: Folder[]; selectedId: string | null; onSelect: (id: string) => void
  onAddNote: (folderId: string) => void; onAddChild: (folder: Folder) => void; onRename: (folder: Folder) => void; onRemove: (folder: Folder) => void
}) {
  const children = (parentId: string | null) => folders.filter(folder => folder.parentId === parentId)
  const renderBranch = (parentId: string | null, depth = 0): ReactElement[] => children(parentId).flatMap(folder => [
    <div className={`folder-row ${selectedId === folder.id ? 'is-selected' : ''}`} style={{ paddingLeft: 16 + depth * 18 }} key={folder.id}>
      <button className="folder-label" onClick={() => onSelect(folder.id)} title={folder.name}><span aria-hidden="true">⌁</span>{folder.name}</button>
      <div className="row-actions">
        <button aria-label={`Nueva nota en ${folder.name}`} title="Nueva nota" onClick={() => onAddNote(folder.id)}>＋</button>
        <button aria-label={`Añadir subcarpeta a ${folder.name}`} title="Nueva subcarpeta" onClick={() => onAddChild(folder)}>⌁</button>
        <button aria-label={`Renombrar ${folder.name}`} onClick={() => onRename(folder)}>✎</button>
        <button aria-label={`Eliminar ${folder.name}`} onClick={() => onRemove(folder)}>×</button>
      </div>
    </div>,
    ...renderBranch(folder.id, depth + 1)
  ])
  return <>{renderBranch(null)}</>
}

export default function App() {
  const [store, setStore] = useState<Store | null>(null)
  const [folderId, setFolderId] = useState<string | null>(null)
  const [noteId, setNoteId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [folderDialog, setFolderDialog] = useState<{ parentId: string | null; folder?: Folder } | null>(null)
  const [folderName, setFolderName] = useState('')
  const [error, setError] = useState('')

  const refresh = useCallback((next: Promise<Store>) => next.then(nextStore => {
    setError('')
    setStore(nextStore)
    return nextStore
  }).catch((reason: unknown) => {
    setError(reason instanceof Error ? reason.message : 'No se pudo guardar el cambio.')
    throw reason
  }), [])
  useEffect(() => { refresh(storeApi.load()).catch(() => undefined) }, [refresh])
  useEffect(() => { if (store && !folderId) setFolderId(store.folders[0]?.id ?? null) }, [store, folderId])
  useEffect(() => { if (store && folderId && !store.folders.some(folder => folder.id === folderId)) { setFolderId(store.folders[0]?.id ?? null); setNoteId(null) } }, [store, folderId])

  const notes = useMemo(() => store?.notes.filter(note => note.folderId === folderId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) ?? [], [store, folderId])
  const selectedNote = store?.notes.find(note => note.id === noteId) ?? null
  const normalizedQuery = query.trim().toLocaleLowerCase('es-ES')
  const searchFolders = normalizedQuery ? (store?.folders.filter(folder => folder.name.toLocaleLowerCase('es-ES').includes(normalizedQuery)) ?? []) : []
  const searchNotes = normalizedQuery ? (store?.notes.filter(note => note.title.toLocaleLowerCase('es-ES').includes(normalizedQuery)) ?? []) : []

  function selectFolder(id: string) { setFolderId(id); setNoteId(null) }
  function openFolderDialog(parentId: string | null, folder?: Folder) {
    setFolderName(folder?.name ?? '')
    setFolderDialog({ parentId, folder })
  }
  async function saveFolderDialog() {
    if (!folderDialog || !folderName.trim()) return
    try {
      const next = folderDialog.folder
        ? storeApi.renameFolder(folderDialog.folder.id, folderName)
        : storeApi.createFolder(folderName, folderDialog.parentId)
      await refresh(next)
      setFolderDialog(null)
    } catch { /* The inline error is already set by refresh. */ }
  }
  function removeFolder(folder: Folder) {
    if (window.confirm(`¿Eliminar “${folder.name}” y todo su contenido? Esta acción no se puede deshacer.`)) {
      if (folderId === folder.id) { setFolderId(null); setNoteId(null) }
      refresh(storeApi.removeFolder(folder.id)).catch(() => undefined)
    }
  }
  async function addNote(targetFolderId = folderId) {
    if (!targetFolderId) return
    try {
      const next = await refresh(storeApi.createNote(targetFolderId, 'Nueva nota'))
      const created = next.notes[next.notes.length - 1]
      setFolderId(targetFolderId)
      setNoteId(created?.id ?? null)
    } catch { /* The inline error is already set by refresh. */ }
  }
  function removeNote(note: Note) {
    if (window.confirm(`¿Eliminar la nota “${note.title}”? Esta acción no se puede deshacer.`)) {
      setNoteId(null); refresh(storeApi.removeNote(note.id)).catch(() => undefined)
    }
  }
  const saveNote = useCallback((note: Note, title: string, content: string) => {
    refresh(storeApi.updateNote(note.id, title, content)).catch(() => undefined)
  }, [refresh])

  if (!store) return <main className="loading">Abriendo Lilac…</main>
  function openSearchNote(note: Note) { setFolderId(note.folderId); setNoteId(note.id); setQuery('') }
  const currentTheme = store.preferences.theme
  function setTheme() { refresh(storeApi.setTheme(currentTheme === 'light' ? 'dark' : 'light')).catch(() => undefined) }

  return <main className={`app-shell theme-${currentTheme}`}>
    <header className="topbar"><div className="brand"><span className="brand-dot" />Lilac</div><span className="topbar-subtitle">Tus notas, en orden</span><button className="theme-toggle" onClick={setTheme} aria-label="Cambiar tema" title="Cambiar tema">{currentTheme === 'light' ? '◐ Oscuro' : '◑ Claro'}</button></header>
    <aside className="sidebar">
      <label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar…" aria-label="Buscar carpetas y notas" /></label>
      {normalizedQuery && <div className="search-results" aria-label="Resultados de búsqueda">
        {searchFolders.map(folder => <button key={`folder-${folder.id}`} onClick={() => { selectFolder(folder.id); setQuery('') }}><span>Carpeta</span>{folder.name}</button>)}
        {searchNotes.map(note => <button key={`note-${note.id}`} onClick={() => openSearchNote(note)}><span>Nota · {store.folders.find(folder => folder.id === note.folderId)?.name ?? 'Sin carpeta'}</span>{note.title}</button>)}
        {!searchFolders.length && !searchNotes.length && <p>Sin resultados.</p>}
      </div>}
      <div className="sidebar-heading"><span>CARPETAS</span><button className="icon-button" onClick={() => openFolderDialog(null)} aria-label="Nueva carpeta" title="Nueva carpeta">＋</button></div>
      <nav aria-label="Carpetas"><FolderTree folders={store.folders} selectedId={folderId} onSelect={selectFolder} onAddNote={addNote} onAddChild={folder => openFolderDialog(folder.id)} onRename={folder => openFolderDialog(folder.parentId, folder)} onRemove={removeFolder} /></nav>
    </aside>
    <section className="note-list">
      <div className="panel-heading"><div><span className="eyebrow">NOTAS</span><h1>{store.folders.find(folder => folder.id === folderId)?.name ?? 'Selecciona una carpeta'}</h1></div><button className="primary-button" disabled={!folderId} onClick={() => { void addNote() }}>Nueva nota</button></div>
      <div className="notes-scroll">{notes.length ? notes.map(note => <button className={`note-card ${note.id === noteId ? 'is-active' : ''}`} key={note.id} onClick={() => setNoteId(note.id)}><strong>{note.title}</strong><span>{note.content || 'Sin contenido'}</span><time>{new Date(note.updatedAt).toLocaleDateString('es-ES')}</time></button>) : <p className="empty-state">Esta carpeta todavía no tiene notas.</p>}</div>
    </section>
    <section className="editor">{selectedNote ? <NoteEditor note={selectedNote} onSave={saveNote} onDelete={removeNote} /> : <div className="editor-empty"><span>✦</span><h2>Elige o crea una nota</h2><p>Selecciona una nota de la lista para empezar a escribir.</p></div>}</section>
    {error && <div className="save-error" role="alert">{error}</div>}
    {folderDialog && <div className="dialog-backdrop" role="presentation"><form className="folder-dialog" onSubmit={event => { event.preventDefault(); void saveFolderDialog() }}><h2>{folderDialog.folder ? 'Renombrar carpeta' : folderDialog.parentId ? 'Nueva subcarpeta' : 'Nueva carpeta'}</h2><input autoFocus value={folderName} onChange={event => setFolderName(event.target.value)} placeholder="Nombre de la carpeta" aria-label="Nombre de la carpeta" /><div><button type="button" onClick={() => setFolderDialog(null)}>Cancelar</button><button className="primary-button" type="submit" disabled={!folderName.trim()}>Guardar</button></div></form></div>}
  </main>
}

function NoteEditor({ note, onSave, onDelete }: { note: Note; onSave: (note: Note, title: string, content: string) => void; onDelete: (note: Note) => void }) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  useEffect(() => { setTitle(note.title); setContent(note.content) }, [note])
  useEffect(() => {
    const id = window.setTimeout(() => { if (title !== note.title || content !== note.content) onSave(note, title, content) }, 550)
    return () => window.clearTimeout(id)
  }, [title, content, note, onSave])
  return <div className="editor-inner"><div className="editor-toolbar"><span>Guardado automático</span><button onClick={() => onDelete(note)} className="danger-button">Eliminar</button></div><input className="note-title" value={title} onChange={event => setTitle(event.target.value)} placeholder="Título de la nota" aria-label="Título" /><textarea value={content} onChange={event => setContent(event.target.value)} placeholder="Escribe aquí tus ideas…" aria-label="Contenido de la nota" /></div>
}
