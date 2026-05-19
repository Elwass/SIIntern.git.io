export function notFoundHandler(req, res) {
  return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' })
}

export function errorHandler(err, req, res, _next) {
  const statusCode = Number(err?.statusCode || err?.status || 500)
  const safeStatusCode = statusCode >= 400 && statusCode < 600 ? statusCode : 500
  const message = safeStatusCode === 500 ? 'Terjadi kesalahan pada server.' : err.message

  console.error('[API ERROR]', {
    method: req.method,
    path: req.originalUrl,
    statusCode: safeStatusCode,
    message: err?.message,
    stack: err?.stack,
  })

  return res.status(safeStatusCode).json({ success: false, message })
}
