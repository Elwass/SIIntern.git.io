import jwt from 'jsonwebtoken'
import { users } from '../data/dummyData.js'

export const login = (req, res) => {
  const { email, password } = req.body
  const user = users.find((u) => u.email === email && u.password === password)
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token, role: user.role })
}
