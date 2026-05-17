import { rateLimit as expressRateLimit } from 'express-rate-limit'

// Rate limiter sederhana berbasis IP + window + max request
export function rateLimit({ windowMs = 10 * 60 * 1000, max = 100 } = {}) {
  return expressRateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Terlalu banyak permintaan. Coba lagi nanti.' },
    handler: (req, res, _next, options) => {
      console.warn('[RATE_LIMIT]', { ip: req.ip, path: req.path, windowMs, max })
      return res.status(options.statusCode).json(options.message)
    },
  })
}
