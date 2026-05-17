import dotenv from 'dotenv'
import mysql from 'mysql2/promise'

dotenv.config()

let mysqlPool

function dbConfig() {
  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'siintern',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  }
}

async function getPool() {
  if (!mysqlPool) {
    const cfg = dbConfig()
    console.log('[DB] Initializing MySQL pool', { host: cfg.host, port: cfg.port, user: cfg.user, database: cfg.database })
    mysqlPool = mysql.createPool(cfg)

    try {
      const conn = await mysqlPool.getConnection()
      await conn.ping()
      conn.release()
      console.log('[DB] MySQL pool connected successfully')
    } catch (error) {
      console.error('[DB] MySQL connection failed', error.message)
      throw error
    }
  }

  return mysqlPool
}

export const pool = {
  async query(sql, params = []) {
    const activePool = await getPool()
    console.log('[DB][QUERY]', sql.split('\n')[0].slice(0, 120))
    return activePool.query(sql, params)
  },
  async end() {
    if (mysqlPool) await mysqlPool.end()
  },
}
