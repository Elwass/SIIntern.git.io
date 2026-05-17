import jwt from 'jsonwebtoken'

const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'

export const authMiddleware = (req, res, next) => {
  const bearerToken = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null
  const token = bearerToken
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, jwtSecret())
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
