export function notFoundHandler(req, res) {
  return res.status(404).json({ message: 'Endpoint tidak ditemukan.' })
}

export function errorHandler(err, req, res, _next) {
  console.error('[API ERROR]', err)

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500
  const message = err?.message || 'Terjadi kesalahan pada server.'

  return res.status(statusCode).json({ message })
}
