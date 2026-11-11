import { session } from 'electron'
import { getDb } from './db'

// Returns the Electron session partition string for a container id.
// Container 0 = default session, others = isolated partitions.
export function partitionForContainer(containerId: number | null): string {
  if (!containerId) return 'persist:default'
  return `persist:container_${containerId}`
}

// Ensure the session for a container exists (Electron creates it lazily on first access).
export function touchContainerSession(containerId: number) {
  const partition = partitionForContainer(containerId)
  const s = session.fromPartition(partition)
  // Apply same privacy hardening as default session — disable Web Bluetooth, etc.
  s.setPermissionRequestHandler((_webContents, permission, callback) => {
    const allowed = ['clipboard-read', 'clipboard-write']
    callback(allowed.includes(permission))
  })
  return s
}

export function getContainerSession(containerId: number | null) {
  if (!containerId) return session.fromPartition('persist:default')
  return session.fromPartition(partitionForContainer(containerId))
}

export async function clearContainerData(containerId: number) {
  const s = session.fromPartition(partitionForContainer(containerId))
  await s.clearStorageData()
  await s.clearCache()
}

// ── CRUD helpers used by IPC ────────────────────────────────────────────────

export function dbGetContainers() {
  const rows = getDb().prepare('SELECT id, name, color, icon, created_at FROM containers ORDER BY id').all() as any[]
  return rows.map(r => ({ id: r.id, name: r.name, color: r.color, icon: r.icon, createdAt: r.created_at }))
}

export function dbCreateContainer(name: string, color: string, icon: string) {
  const info = getDb().prepare('INSERT INTO containers (name, color, icon) VALUES (?, ?, ?)').run(name, color, icon)
  const row = getDb().prepare('SELECT id, name, color, icon, created_at FROM containers WHERE id = ?').get(info.lastInsertRowid) as any
  return { id: row.id, name: row.name, color: row.color, icon: row.icon, createdAt: row.created_at }
}

export function dbUpdateContainer(id: number, updates: { name?: string; color?: string; icon?: string }) {
  const fields: string[] = []
  const vals: unknown[] = []
  if (updates.name  !== undefined) { fields.push('name = ?');  vals.push(updates.name) }
  if (updates.color !== undefined) { fields.push('color = ?'); vals.push(updates.color) }
  if (updates.icon  !== undefined) { fields.push('icon = ?');  vals.push(updates.icon) }
  if (!fields.length) return false
  vals.push(id)
  const info = getDb().prepare(`UPDATE containers SET ${fields.join(', ')} WHERE id = ?`).run(...vals as [])
  return info.changes > 0
}

export function dbDeleteContainer(id: number) {
  const info = getDb().prepare('DELETE FROM containers WHERE id = ?').run(id)
  return info.changes > 0
}
