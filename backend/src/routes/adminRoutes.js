import { Router } from 'express'
import {
  assignApplicationMentor,
  getAdminApplicationDetail,
  listAdminApplications,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
} from '../controllers/applicationController.js'
import { authMiddleware } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/asyncHandler.js'

const router = Router()
router.use(authMiddleware)
router.get('/applications', asyncHandler(listAdminApplications))
router.get('/applications/:id', asyncHandler(getAdminApplicationDetail))
router.patch('/applications/:id/status', asyncHandler(updateAdminApplicationStatus))
router.patch('/applications/:id/documents/:documentId/status', asyncHandler(updateAdminDocumentStatus))
router.patch('/applications/:id/assign-mentor', asyncHandler(assignApplicationMentor))
export default router
