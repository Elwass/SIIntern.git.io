import jwt from 'jsonwebtoken'

const jwtSecret = () => process.env.JWT_SECRET || 'super-secret'

// Middleware proteksi route dengan JWT Bearer token
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null

  if (!token) {
    console.warn('[AUTH] Missing bearer token', { path: req.path })
    return res.status(401).json({ message: 'Unauthorized: token tidak ditemukan.' })
  }

  try {
    req.user = jwt.verify(token, jwtSecret())
    return next()
  } catch (error) {
    console.warn('[AUTH] Invalid token', { error: error.message })
    return res.status(401).json({ message: 'Unauthorized: token tidak valid.' })
  }
}
