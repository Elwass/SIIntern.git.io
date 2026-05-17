import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import mentorRoutes from './routes/mentorRoutes.js'
import { rateLimit } from './middleware/rateLimit.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'
import { pool } from './config/db.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(rateLimit({ windowMs: 10 * 60 * 1000, max: 200 }))

app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/student', studentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/mentor', mentorRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.use(notFoundHandler)
app.use(errorHandler)

app.listen(process.env.PORT || 5000, async () => {
  console.log('Backend running')
  try {
    const [rows] = await pool.query('SELECT 1 AS ok')
    console.log('[DB] Startup SELECT 1 success:', rows[0])
  } catch (error) {
    console.error('[DB] Startup SELECT 1 failed:', error.message)
  }
})
