import { Router } from 'express'
import { forgotPassword, login, logout, me, register, resendOtp, resetPassword, signin, signup, verifySignin, verifySignup } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.post('/register', register)
router.post('/signup', signup)
router.post('/verify-signup', verifySignup)
router.post('/signin', signin)
router.post('/login', login)
router.post('/verify-signin', verifySignin)
router.post('/verify-login', verifySignin)
router.post('/resend-otp', resendOtp)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/logout', logout)
router.get('/me', authMiddleware, me)

export default router
