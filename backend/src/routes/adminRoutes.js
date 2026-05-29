import { Router } from 'express'
import {
  approveAdminApplication,
  assignApplicationMentor,
  createAdminMentor,
  deleteAdminMentor,
  getAdminApplicationDetail,
  listAdminMentors,
  listUsers,
  listAdminApplications,
  rejectAdminApplication,
  updateAdminApplicationStatus,
  updateAdminDocumentStatus,
  updateAdminMentor,
  verifyAdminApplication,
} from '../controllers/applicationController.js'
import { adminDashboard, adminSendNotification, exportReport, listAttendance, listMyNotifications, markMyNotificationRead, upsertStaffAttendance } from '../controllers/workflowController.js'
import { requireCompleteApplicationDocuments } from '../middleware/applicationValidation.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
const reviewRoles = ['admin', 'pembimbing_lapangan']
const verificationRoles = ['admin']

router.use(authMiddleware)
router.get('/dashboard', authorizeRoles(reviewRoles), asyncHandler(adminDashboard))
router.get('/notifications', authorizeRoles(reviewRoles), asyncHandler(listMyNotifications))
router.patch('/notifications/:id/read', authorizeRoles(reviewRoles), asyncHandler(markMyNotificationRead))
router.post('/notifications', authorizeRoles(verificationRoles), asyncHandler(adminSendNotification))
router.get('/reports/:type', authorizeRoles(reviewRoles), asyncHandler(exportReport))
router.get('/attendance', authorizeRoles(reviewRoles), asyncHandler(listAttendance))
router.patch('/attendance/:applicationId', authorizeRoles(verificationRoles), asyncHandler(upsertStaffAttendance))
router.post('/attendance/:applicationId', authorizeRoles(verificationRoles), asyncHandler(upsertStaffAttendance))
router.get('/users', authorizeRoles(reviewRoles), asyncHandler(listUsers))
router.get('/mentors', authorizeRoles(reviewRoles), asyncHandler(listAdminMentors))
router.post('/mentors', authorizeRoles(verificationRoles), asyncHandler(createAdminMentor))
router.put('/mentors/:id', authorizeRoles(verificationRoles), asyncHandler(updateAdminMentor))
router.delete('/mentors/:id', authorizeRoles(verificationRoles), asyncHandler(deleteAdminMentor))
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
