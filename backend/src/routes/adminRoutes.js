import { Router } from 'express'
import {
  assignApplicationMentor,
  getAdminApplicationDetail,
  listAdminApplications,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
} from '../controllers/applicationController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)
router.get('/applications', listAdminApplications)
router.get('/applications/:id', getAdminApplicationDetail)
router.patch('/applications/:id/status', updateAdminApplicationStatus)
router.patch('/applications/:id/documents/:documentId/status', updateAdminDocumentStatus)
router.patch('/applications/:id/assign-mentor', assignApplicationMentor)
export default router
