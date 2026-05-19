import { Router } from 'express'
import { getMentorApplicationDetail, listMentorApplications } from '../controllers/applicationController.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()
router.use(authMiddleware)
router.get('/applications', asyncHandler(listMentorApplications))
router.get('/applications/:id', asyncHandler(getMentorApplicationDetail))
export default router
