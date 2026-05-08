import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from '../config/db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8')
const statements = schema
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean)

for (const statement of statements) {
  await pool.query(statement)
}

await pool.end()
console.log('Database schema migrated')
