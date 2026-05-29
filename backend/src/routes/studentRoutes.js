import { Router } from 'express'
import {
  createStudentApplication,
  createStudentApplicationDocument,
  deleteStudentApplicationDocument,
  getApplicationOptions,
  getCurrentStudentApplication,
  getStudentApplicationDocuments,
  submitStudentApplication,
  updateStudentApplication,
} from '../controllers/applicationController.js'
import { checkInStudentAttendance, checkOutStudentAttendance, createStudentLogbook, deleteStudentLogbook, exportReport, getEvaluation, listAttendance, listMyNotifications, listStudentLogbooks, markMyNotificationRead } from '../controllers/workflowController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
router.use(authMiddleware)
router.use(authorizeRoles('student'))
router.get('/notifications', asyncHandler(listMyNotifications))
router.patch('/notifications/:id/read', asyncHandler(markMyNotificationRead))
router.get('/reports/:type', asyncHandler(exportReport))
router.get('/applications/options', asyncHandler(getApplicationOptions))
router.get('/applications/current', asyncHandler(getCurrentStudentApplication))
router.get('/my-application', asyncHandler(getCurrentStudentApplication))
router.post('/applications', asyncHandler(createStudentApplication))
router.post('/register-internship', asyncHandler(createStudentApplication))
router.put('/applications/:id', asyncHandler(updateStudentApplication))
router.post('/applications/:id/submit', asyncHandler(submitStudentApplication))
router.patch('/applications/:id/submit', asyncHandler(submitStudentApplication))
router.post('/applications/:id/documents', asyncHandler(createStudentApplicationDocument))
router.get('/applications/:id/documents', asyncHandler(getStudentApplicationDocuments))
router.delete('/applications/:id/documents/:documentId', asyncHandler(deleteStudentApplicationDocument))
router.get('/applications/:applicationId/logbooks', asyncHandler(listStudentLogbooks))
router.post('/applications/:applicationId/logbooks', asyncHandler(createStudentLogbook))
router.put('/applications/:applicationId/logbooks/:logbookId', asyncHandler(createStudentLogbook))
router.delete('/applications/:applicationId/logbooks/:logbookId', asyncHandler(deleteStudentLogbook))
router.get('/applications/:applicationId/attendance', asyncHandler(listAttendance))
router.post('/applications/:applicationId/attendance/check-in', asyncHandler(checkInStudentAttendance))
router.post('/applications/:applicationId/attendance/check-out', asyncHandler(checkOutStudentAttendance))
router.get('/applications/:applicationId/evaluation', asyncHandler(getEvaluation))
router.get('/dashboard', asyncHandler(getCurrentStudentApplication))
export default router
