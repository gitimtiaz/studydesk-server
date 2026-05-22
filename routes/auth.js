const router  = require('express').Router()
const bcrypt  = require('bcryptjs')
const User    = require('../models/User')

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

module.exports = router