import { readdir, readFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { db } from './index.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dir, '../../migrations')

export async function runMigrations() {
  // Ensure migrations table exists
  await db.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename TEXT NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `)

  const applied = new Set(
    (await db.query('SELECT filename FROM migrations')).rows.map((r) => r.filename)
  )

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    if (applied.has(file)) continue
    const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8')
    await db.query('BEGIN')
    try {
      await db.query(sql)
      await db.query('INSERT INTO migrations (filename) VALUES ($1)', [file])
      await db.query('COMMIT')
      console.log(`  ✓ migration applied: ${file}`)
    } catch (err) {
      await db.query('ROLLBACK')
      throw new Error(`Migration ${file} failed: ${err.message}`)
    }
  }
}
