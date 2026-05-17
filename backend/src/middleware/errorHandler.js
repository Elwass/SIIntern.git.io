export function notFoundHandler(req, res) {
  return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' })
}

export function errorHandler(err, req, res, _next) {
  console.error('[API ERROR]', err)

  const isDev = process.env.NODE_ENV === 'development'
  return res.status(500).json({
    success: false,
    message: err?.message || 'Internal Server Error',
    ...(isDev ? { stack: err?.stack } : {}),
  })
}
