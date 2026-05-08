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
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)
router.get('/applications/options', getApplicationOptions)
router.get('/applications/current', getCurrentStudentApplication)
router.post('/applications', createStudentApplication)
router.put('/applications/:id', updateStudentApplication)
router.post('/applications/:id/submit', submitStudentApplication)
router.post('/applications/:id/documents', createStudentApplicationDocument)
router.get('/applications/:id/documents', getStudentApplicationDocuments)
router.delete('/applications/:id/documents/:documentId', deleteStudentApplicationDocument)
router.get('/dashboard', getCurrentStudentApplication)
export default router
