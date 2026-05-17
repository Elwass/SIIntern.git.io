export function notFoundHandler(req, res) {
  return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' })
}

export function errorHandler(err, req, res, _next) {
  console.error('[API ERROR]', err)
  return res.status(500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    stack: err?.stack,
  })
}
