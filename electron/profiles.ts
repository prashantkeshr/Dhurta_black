import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import Database from 'better-sqlite3'

// Profiles live in userData/profiles/<id>/
// Each profile has its own SQLite DB and Electron session partition.

function profilesDir() {
  return path.join(app.getPath('userData'), 'profiles')
}

function ensureProfilesDir() {
  const dir = profilesDir()
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function registryPath() {
  return path.join(app.getPath('userData'), 'profiles-registry.json')
}

interface ProfileEntry {
  id: string
  name: string
  createdAt: number
}

function readRegistry(): ProfileEntry[] {
  try { return JSON.parse(fs.readFileSync(registryPath(), 'utf8')) } catch { return [] }
}

function writeRegistry(entries: ProfileEntry[]) {
  fs.writeFileSync(registryPath(), JSON.stringify(entries, null, 2), 'utf8')
}

export function getProfiles() {
  return readRegistry()
}

export function createProfile(name: string): ProfileEntry {
  ensureProfilesDir()
  const id = `profile_${Date.now()}`
  const createdAt = Date.now()
  const entry: ProfileEntry = { id, name, createdAt }
  const reg = readRegistry()
  reg.push(entry)
  writeRegistry(reg)

  // Create a minimal DB for the profile
  const dbPath = path.join(profilesDir(), `${id}.db`)
  const db = new Database(dbPath)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    INSERT OR IGNORE INTO settings (key, value) VALUES ('profileId', '${id}');
  `)
  db.close()

  return entry
}

export function deleteProfile(id: string): boolean {
  const reg = readRegistry()
  const idx = reg.findIndex(p => p.id === id)
  if (idx === -1) return false
  reg.splice(idx, 1)
  writeRegistry(reg)

  // Clean up DB file
  try {
    const dbPath = path.join(profilesDir(), `${id}.db`)
    if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
  } catch (e) {
    console.warn('[Profiles] cleanup failed:', e)
  }
  return true
}

export function switchProfile(_id: string) {
  // Profile switching requires app restart to change userData path.
  // For now, we store the pending switch and app will restart.
  const switchPath = path.join(app.getPath('userData'), 'pending-profile.json')
  fs.writeFileSync(switchPath, JSON.stringify({ id: _id }), 'utf8')
  app.relaunch()
  app.exit(0)
}
