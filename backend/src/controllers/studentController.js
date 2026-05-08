import { getCurrentStudentApplication } from './applicationController.js'

export const getStudentDashboard = getCurrentStudentApplication
export const getStudentProfile = (req, res) => res.json({ userId: req.user.id, name: req.user.email })
export const updateStudentProfile = (req, res) => res.json({ userId: req.user.id, ...req.body })
export const getStudentApplications = getCurrentStudentApplication
export { createStudentApplication } from './applicationController.js'
export const getStudentDocuments = (_, res) => res.json([])
export const createStudentDocument = (_, res) => res.status(410).json({ message: 'Gunakan endpoint dokumen pendaftaran magang.' })
export const deleteStudentDocument = (_, res) => res.status(410).json({ message: 'Gunakan endpoint dokumen pendaftaran magang.' })
export const getStudentLogbooks = (_, res) => res.json({ entries: [], summary: { submittedCount: 0 } })
export const createStudentLogbook = (_, res) => res.status(410).json({ message: 'Logbook belum tersedia pada scope ini.' })
export const updateStudentLogbook = (_, res) => res.status(410).json({ message: 'Logbook belum tersedia pada scope ini.' })
export const getStudentMentor = (_, res) => res.json(null)
export const getStudentAssessments = (_, res) => res.json([])
export const getStudentNotifications = (_, res) => res.json([])
export const __testing = {}
