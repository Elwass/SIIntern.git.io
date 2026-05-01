import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config()
const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.listen(process.env.PORT || 5000, () => console.log('Backend running'))
