import { Router } from 'express'
import { getMentorApplicationDetail, listMentorApplications } from '../controllers/applicationController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
router.use(authMiddleware)
router.use(authorizeRoles('mentor', 'pembimbing_lapangan'))
router.get('/applications', asyncHandler(listMentorApplications))
router.get('/applications/:id', asyncHandler(getMentorApplicationDetail))
export default router
