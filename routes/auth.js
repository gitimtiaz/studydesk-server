const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

// Helper: sign token + set cookie
function setTokenCookie(res, userId) {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge:   7 * 24 * 60 * 60 * 1000,
  })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, image } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await User.create({
      name,
      email,
      password: hashed,
      image: image || '',
    })

    res.status(201).json({
      message: 'Registration successful! Please login.',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email })
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    setTokenCookie(res, user._id)

    res.json({
      message: 'Login successful',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { name, email, image } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }
    
    let user = await User.findOne({ email })

    if (!user) {
      user = await User.create({
        name:  name  || 'Google User',
        email,
        image: image || '',
        password: null,
      })
    }

    setTokenCookie(res, user._id)

    res.json({
      message: 'Google login successful',
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  })
  res.json({ message: 'Logged out successfully' })
})

// GET /api/auth/me (protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({
      user: {
        id:    user._id,
        name:  user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router