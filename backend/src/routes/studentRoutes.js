import { Router } from 'express'
import {
  createStudentApplication,
  createStudentDocument,
  createStudentLogbook,
  deleteStudentDocument,
  getStudentApplications,
  getStudentAssessments,
  getStudentDashboard,
  getStudentDocuments,
  getStudentLogbooks,
  getStudentMentor,
  getStudentNotifications,
  getStudentProfile,
  updateStudentLogbook,
  updateStudentProfile,
} from '../controllers/studentController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)
router.get('/dashboard', getStudentDashboard)
router.get('/profile', getStudentProfile)
router.put('/profile', updateStudentProfile)
router.get('/applications', getStudentApplications)
router.post('/applications', createStudentApplication)
router.get('/documents', getStudentDocuments)
router.post('/documents', createStudentDocument)
router.delete('/documents/:id', deleteStudentDocument)
router.get('/logbooks', getStudentLogbooks)
router.post('/logbooks', createStudentLogbook)
router.put('/logbooks/:id', updateStudentLogbook)
router.get('/mentor', getStudentMentor)
router.get('/assessments', getStudentAssessments)
router.get('/notifications', getStudentNotifications)

export default router
