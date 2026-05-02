import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { dashboardData } from '../data/dummyData.js'

const router = Router()
router.get('/summary', authMiddleware, (req, res) => {
  res.json({ ...dashboardData, role: req.user.role })
})

export default router
