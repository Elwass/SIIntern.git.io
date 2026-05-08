import jwt from 'jsonwebtoken'

const jwtSecret = () => process.env.JWT_SECRET || 'siintern-development-secret'

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })
  try {
    req.user = jwt.verify(token, jwtSecret())
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid token' })
  }
}
