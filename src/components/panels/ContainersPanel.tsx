import React, { useEffect, useState } from 'react'
import type { Container } from '../../types'

const api = () => (window as any).dhurta

const COLORS = ['#00D4FF','#FF9500','#7C3AED','#FF0033','#00C853','#FFD600','#FF6E40','#40C4FF']
const ICONS  = ['👤','💼','⚡','🕶','🔬','🛡','🌐','🔑']

export default function ContainersPanel() {
  const [containers, setContainers] = useState<Container[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [newColor, setNewColor] = useState(COLORS[0])
  const [newIcon, setNewIcon]   = useState(ICONS[0])
  const [editId, setEditId]     = useState<number | null>(null)
  const [editName, setEditName] = useState('')

  async function load() {
    try { setContainers(await api().getContainers()) } catch {}
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    await api().createContainer(newName.trim(), newColor, newIcon)
    setCreating(false); setNewName(''); setNewColor(COLORS[0]); setNewIcon(ICONS[0])
    load()
  }

  async function handleDelete(id: number) {
    await api().deleteContainer(id); load()
  }

  async function handleRename(id: number) {
    if (!editName.trim()) return
    await api().updateContainer(id, { name: editName.trim() })
    setEditId(null); load()
  }

  return (
    <div className="flex flex-col h-full text-text">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-cyan">Storage Containers</h2>
        <button onClick={() => setCreating(true)}
          className="text-xs text-cyan/70 hover:text-cyan px-2 py-1 rounded-lg hover:bg-cyan/10 transition-colors">
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Default container */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-surface2/40 border border-border/40">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background: '#444' }}>🌐</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text/70">Default</div>
            <div className="text-[10px] text-text/40">Shared session — no isolation</div>
          </div>
        </div>

        {containers.map(c => (
          <div key={c.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-surface2/60 transition-colors group border border-transparent hover:border-border/40">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0" style={{ background: c.color + '33', border: `1.5px solid ${c.color}66` }}>
              {c.icon}
            </div>
            <div className="flex-1 min-w-0">
              {editId === c.id ? (
                <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                  onBlur={() => handleRename(c.id)}
                  onKeyDown={e => { if (e.key === 'Enter') handleRename(c.id); if (e.key === 'Escape') setEditId(null) }}
                  className="text-xs bg-surface2 border border-cyan/50 rounded px-1 w-full outline-none" />
              ) : (
                <div className="text-xs font-medium truncate" style={{ color: c.color }}>{c.name}</div>
              )}
              <div className="text-[10px] text-text/40">Isolated cookies · cache · storage</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => { setEditId(c.id); setEditName(c.name) }}
                className="text-[10px] text-text/50 hover:text-cyan px-1 py-0.5 rounded">✎</button>
              <button onClick={() => handleDelete(c.id)}
                className="text-[10px] text-text/50 hover:text-red-400 px-1 py-0.5 rounded">✕</button>
            </div>
          </div>
        ))}

        {/* Create form */}
        {creating && (
          <div className="border border-cyan/40 rounded-xl p-3 bg-surface2/40 space-y-2">
            <input autoFocus placeholder="Container name" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              className="text-xs bg-surface2 border border-border/60 rounded-lg px-2 py-1.5 w-full outline-none focus:border-cyan/50" />
            <div>
              <div className="text-[10px] text-text/40 mb-1">Color</div>
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => setNewColor(c)}
                    className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ background: c, outline: newColor === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-text/40 mb-1">Icon</div>
              <div className="flex gap-1 flex-wrap">
                {ICONS.map(i => (
                  <button key={i} onClick={() => setNewIcon(i)}
                    className={`text-sm w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${newIcon === i ? 'bg-cyan/20 border border-cyan/50' : 'hover:bg-surface3'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex-1 text-xs bg-cyan/20 hover:bg-cyan/30 text-cyan py-1.5 rounded-lg transition-colors">Create</button>
              <button onClick={() => setCreating(false)} className="flex-1 text-xs text-text/50 hover:text-text py-1.5 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t border-border/40 shrink-0">
        <p className="text-[10px] text-text/35 leading-snug">
          Each container has isolated cookies, localStorage, and cache. Great for multi-account workflows.
        </p>
      </div>
    </div>
  )
}
