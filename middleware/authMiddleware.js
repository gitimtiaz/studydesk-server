const jwt = require('jsonwebtoken')

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies?.token

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized — no token' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.userId }
    next()
  } catch {
    return res.status(401).json({ message: 'Unauthorized — invalid or expired token' })
  }
}