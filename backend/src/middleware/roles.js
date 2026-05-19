export function authorizeRoles(...roles) {
  const allowedRoles = roles.flat().filter(Boolean)

  return (req, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Akses ditolak untuk peran pengguna ini.' })
    }

    return next()
  }
}
