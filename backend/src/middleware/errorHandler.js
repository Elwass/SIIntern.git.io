export function notFoundHandler(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan.',
    detail: `Tidak ada route untuk ${req.method} ${req.originalUrl}`,
  })
}

export function errorHandler(err, req, res, _next) {
  console.error('[API ERROR]', {
    path: req.originalUrl,
    method: req.method,
    message: err?.message,
    stack: err?.stack,
  })

  const statusCode = Number.isInteger(err?.statusCode) ? err.statusCode : 500
  const message = err?.message || 'Terjadi kesalahan pada server.'

  return res.status(statusCode).json({
    success: false,
    message,
    detail: err?.detail || err?.stack?.split('\n')[0] || 'N/A',
  })
}
