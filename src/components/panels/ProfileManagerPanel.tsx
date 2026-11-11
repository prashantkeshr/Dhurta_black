import React, { useEffect, useState } from 'react'

interface Profile {
  id: string
  name: string
  createdAt: number
}

const api = () => (window as any).dhurta

export default function ProfileManagerPanel() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [creating, setCreating] = useState(false)
  const [newName, setNewName]   = useState('')
  const [switching, setSwitching] = useState<string | null>(null)

  async function load() {
    try { setProfiles(await api().getProfiles()) } catch {}
  }

  useEffect(() => { load() }, [])

  async function handleCreate() {
    if (!newName.trim()) return
    await api().createProfile(newName.trim())
    setCreating(false); setNewName(''); load()
  }

  async function handleSwitch(id: string) {
    if (!confirm('Switch profile? The browser will restart.')) return
    setSwitching(id)
    try { await api().switchProfile(id) } catch (e) {
      alert('Failed to switch: ' + String(e))
      setSwitching(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this profile? Its data cannot be recovered.')) return
    await api().deleteProfile(id); load()
  }

  async function handleBurnSession() {
    if (!confirm('Burn session? This clears all cookies, cache, and storage for the current session.')) return
    try { await api().burnSession(); alert('Session burned. Restart the browser to begin fresh.') } catch (e) { alert(String(e)) }
  }

  const fmt = (ts: number) => new Date(ts).toLocaleDateString()

  return (
    <div className="flex flex-col h-full text-text">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <h2 className="text-sm font-semibold text-cyan">Profiles</h2>
        <button onClick={() => setCreating(true)}
          className="text-xs text-cyan/70 hover:text-cyan px-2 py-1 rounded-lg hover:bg-cyan/10 transition-colors">
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {/* Default profile */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan/8 border border-cyan/30">
          <div className="w-7 h-7 rounded-full bg-cyan/20 flex items-center justify-center text-xs text-cyan font-bold">D</div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-cyan">Default Profile</div>
            <div className="text-[10px] text-text/40">Currently active</div>
          </div>
          <span className="text-[10px] bg-cyan/20 text-cyan px-1.5 py-0.5 rounded">Active</span>
        </div>

        {profiles.map(p => (
          <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-border/40 hover:bg-surface2/40 group transition-colors">
            <div className="w-7 h-7 rounded-full bg-surface3 flex items-center justify-center text-xs text-text/70 font-bold">
              {p.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-text/90 truncate">{p.name}</div>
              <div className="text-[10px] text-text/40">Created {fmt(p.createdAt)}</div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleSwitch(p.id)} disabled={switching === p.id}
                className="text-[10px] bg-cyan/15 hover:bg-cyan/25 text-cyan px-2 py-0.5 rounded-lg transition-colors disabled:opacity-50">
                {switching === p.id ? '…' : 'Switch'}
              </button>
              <button onClick={() => handleDelete(p.id)}
                className="text-[10px] text-text/40 hover:text-red-400 px-1 py-0.5 rounded">✕</button>
            </div>
          </div>
        ))}

        {creating && (
          <div className="border border-cyan/40 rounded-xl p-3 bg-surface2/40 space-y-2">
            <input autoFocus placeholder="Profile name" value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              className="text-xs bg-surface2 border border-border/60 rounded-lg px-2 py-1.5 w-full outline-none focus:border-cyan/50" />
            <div className="flex gap-2">
              <button onClick={handleCreate} className="flex-1 text-xs bg-cyan/20 hover:bg-cyan/30 text-cyan py-1.5 rounded-lg transition-colors">Create</button>
              <button onClick={() => setCreating(false)} className="flex-1 text-xs text-text/50 hover:text-text py-1.5 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Burn session */}
      <div className="px-3 py-3 border-t border-border/40 shrink-0">
        <button onClick={handleBurnSession}
          className="w-full text-xs py-2 rounded-xl border border-[#FF4500]/40 text-[#FF4500]/80 hover:bg-[#FF4500]/10 hover:border-[#FF4500]/70 transition-colors">
          🔥 Burn Current Session
        </button>
        <p className="text-[10px] text-text/35 mt-1.5 text-center leading-snug">
          Clears all cookies, cache and storage for this session.
        </p>
      </div>
    </div>
  )
}
