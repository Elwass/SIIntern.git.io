import { Router } from 'express'
import { login, me, register } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.get('/me', authMiddleware, me)
router.post('/login', login)
router.post('/register', register)
export default router
