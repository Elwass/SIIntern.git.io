import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { getCurrentStudentApplication } from '../controllers/applicationController.js'

const router = Router()
router.get('/summary', authMiddleware, (req, res) => {
  if (req.user.role === 'student') return getCurrentStudentApplication(req, res)
  return res.json({ role: req.user.role, message: 'Gunakan endpoint pendaftaran sesuai peran.' })
})
export default router
