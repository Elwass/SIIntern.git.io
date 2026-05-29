import { Router } from 'express'
import { getMentorApplicationDetail, listMentorApplications } from '../controllers/applicationController.js'
import { exportReport, getEvaluation, listAttendance, listMentorLogbooks, listMyNotifications, markMyNotificationRead, mentorReviewDocument, reviewMentorLogbook, upsertMentorEvaluation, upsertStaffAttendance } from '../controllers/workflowController.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
router.use(authMiddleware)
router.use(authorizeRoles('mentor', 'pembimbing_lapangan'))
router.get('/notifications', asyncHandler(listMyNotifications))
router.patch('/notifications/:id/read', asyncHandler(markMyNotificationRead))
router.get('/reports/:type', asyncHandler(exportReport))
router.get('/attendance', asyncHandler(listAttendance))
router.get('/applications/:applicationId/attendance', asyncHandler(listAttendance))
router.post('/applications/:applicationId/attendance', asyncHandler(upsertStaffAttendance))
router.patch('/applications/:applicationId/attendance', asyncHandler(upsertStaffAttendance))
router.get('/logbooks', asyncHandler(listMentorLogbooks))
router.get('/applications/:applicationId/logbooks', asyncHandler(listMentorLogbooks))
router.patch('/applications/:applicationId/logbooks/:logbookId/review', asyncHandler(reviewMentorLogbook))
router.patch('/applications/:applicationId/documents/:documentId/review', asyncHandler(mentorReviewDocument))
router.get('/applications/:applicationId/evaluation', asyncHandler(getEvaluation))
router.put('/applications/:applicationId/evaluation', asyncHandler(upsertMentorEvaluation))
router.get('/applications', asyncHandler(listMentorApplications))
router.get('/applications/:id', asyncHandler(getMentorApplicationDetail))
export default router
