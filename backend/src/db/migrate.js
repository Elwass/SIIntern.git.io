import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pool } from '../config/db.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8')
await pool.query(schema)
await pool.end()
console.log('Database schema migrated')
