import { Router } from 'express'
import { getMentorApplicationDetail, listMentorApplications } from '../controllers/applicationController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)
router.get('/applications', listMentorApplications)
router.get('/applications/:id', getMentorApplicationDetail)
export default router
