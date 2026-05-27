import { Router } from 'express'
import {
  approveAdminApplication,
  assignApplicationMentor,
  getAdminApplicationDetail,
  listUsers,
  listAdminApplications,
  rejectAdminApplication,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
  verifyAdminApplication,
} from '../controllers/applicationController.js'
import { requireCompleteApplicationDocuments } from '../middleware/applicationValidation.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
const reviewRoles = ['admin', 'pembimbing_lapangan']
const verificationRoles = ['admin']

router.use(authMiddleware)
router.get('/users', authorizeRoles(reviewRoles), asyncHandler(listUsers))
router.get('/applications', authorizeRoles(reviewRoles), asyncHandler(listAdminApplications))
router.get('/applications/:id', authorizeRoles(reviewRoles), asyncHandler(getAdminApplicationDetail))
router.put('/applications/:id/verify', authorizeRoles(verificationRoles), asyncHandler(requireCompleteApplicationDocuments), asyncHandler(verifyAdminApplication))
router.put('/applications/:id/approve', authorizeRoles(verificationRoles), asyncHandler(approveAdminApplication))
router.put('/applications/:id/reject', authorizeRoles(verificationRoles), asyncHandler(rejectAdminApplication))
router.patch('/applications/:id/status', authorizeRoles(verificationRoles), asyncHandler(updateAdminApplicationStatus))
router.patch('/applications/:id', authorizeRoles(verificationRoles), asyncHandler(updateAdminApplicationStatus))
router.patch('/applications/:id/documents/:documentId/status', authorizeRoles(verificationRoles), asyncHandler(updateAdminDocumentStatus))
router.patch('/applications/:id/documents/:docId/status', authorizeRoles(verificationRoles), asyncHandler(updateAdminDocumentStatus))
router.patch('/applications/:application_id/documents/:document_id/status', authorizeRoles(verificationRoles), asyncHandler(updateAdminDocumentStatus))
router.patch('/applications/:id/assign-mentor', authorizeRoles(verificationRoles), asyncHandler(assignApplicationMentor))
router.post('/applications/:applicationId/assign-mentor', authorizeRoles(verificationRoles), asyncHandler((req, _res, next) => {
  req.params.id = req.params.applicationId
  return next()
}), asyncHandler(assignApplicationMentor))
export default router
