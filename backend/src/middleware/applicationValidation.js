import { requiredDocumentTypes } from '../constants/applicationConstants.js'
import * as applications from '../repositories/applicationRepository.js'

function summarizeMissingDocuments(documents = []) {
  const uploadedDocumentTypes = new Set(documents.map((document) => document.jenisDokumen))
  return requiredDocumentTypes.filter((type) => !uploadedDocumentTypes.has(type))
}

export async function requireCompleteApplicationDocuments(req, res, next) {
  const application = await applications.getApplicationById(req.params.id)

  if (!application) {
    return res.status(404).json({ message: 'Pendaftaran magang tidak ditemukan.' })
  }

  const documents = await applications.listDocuments(application.id)
  const missing = summarizeMissingDocuments(documents)

  if (missing.length > 0) {
    return res.status(400).json({
      message: `Dokumen wajib belum lengkap: ${missing.join(', ')}.`,
      details: { missingDocuments: missing },
    })
  }

  req.application = application
  req.applicationDocuments = documents
  return next()
}
