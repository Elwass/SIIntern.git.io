  import dotenv from 'dotenv'

  dotenv.config()

  let mysqlPool

  async function getPool() {
    if (!mysqlPool) {
      const mysql = await import('mysql2/promise')
      mysqlPool = mysql.default.createPool({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'siintern',
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: false,
      })
    }

    return mysqlPool
  }

  export const pool = {
    async query(sql, params) {
      const activePool = await getPool()
      return activePool.query(sql, params)
    },
    async end() {
      if (mysqlPool) await mysqlPool.end()
    },
  }
