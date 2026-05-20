import pg from 'pg'

const { Pool } = pg

export const db = new Pool({
  connectionString:      process.env.DATABASE_URL,
  max:                   10,
  idleTimeoutMillis:     30_000,
  connectionTimeoutMillis: 5_000,
  statement_timeout:     30_000,   // kill any query running > 30 s
})

db.on('error', (err) => {
  console.error('Postgres pool error:', err.message)
})
