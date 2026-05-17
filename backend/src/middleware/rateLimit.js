const hits = new Map()

export function rateLimit({ windowMs = 10 * 60 * 1000, max = 100 } = {}) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`
    const now = Date.now()
    const item = hits.get(key) || { count: 0, resetAt: now + windowMs }
    if (now > item.resetAt) {
      item.count = 0
      item.resetAt = now + windowMs
    }
    item.count += 1
    hits.set(key, item)
    if (item.count > max) return res.status(429).json({ message: 'Terlalu banyak permintaan. Coba lagi nanti.' })
    return next()
  }
}
