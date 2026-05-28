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
import { asyncHandler } from '../middleware/asyncHandler.js'
import { authMiddleware } from '../middleware/auth.js'
import { authorizeRoles } from '../middleware/roles.js'

const router = Router()
router.use(authMiddleware)
router.use(authorizeRoles('student'))
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
router.get('/dashboard', asyncHandler(getCurrentStudentApplication))
export default router
