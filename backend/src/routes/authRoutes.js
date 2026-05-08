import { Router } from 'express'
import { login } from '../controllers/authController.js'

const router = Router()
router.get('/me', authMiddleware, me)
router.post('/login', login)
router.post('/register', register)
export default router
