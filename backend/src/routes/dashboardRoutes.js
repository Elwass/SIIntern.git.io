import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { __testing as studentController } from '../controllers/studentController.js'

const router = Router()
router.get('/summary', authMiddleware, (req, res) => {
  if (req.user.role === 'student') {
    return res.json(studentController.buildDashboard(req.user.id))
  }

  return res.json({
    role: req.user.role,
    message: 'Dashboard ringkas tersedia sesuai peran pengguna.',
  })
})

export default router
