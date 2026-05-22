const router = require('express').Router()
const Room   = require('../models/Room')
const authMiddleware = require('../middleware/authMiddleware')

// GET /api/rooms
router.get('/', async (req, res) => {
  try {
    const { search, amenities } = req.query
    const filter = {}

    if (search) {
      filter.name = { $regex: search, $options: 'i' }
    }

    if (amenities) {
      const list = amenities.split(',').map(a => a.trim()).filter(Boolean)
      if (list.length) filter.amenities = { $in: list }
    }

    const rooms = await Room.find(filter).sort({ createdAt: -1 })

    res.json({ rooms })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/rooms/latest
router.get('/latest', async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 }).limit(6)
    res.json({ rooms })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/rooms/my-listings
router.get('/my-listings', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find({ ownerId: req.user.id }).sort({ createdAt: -1 })
    res.json({ rooms })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/rooms/:id
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }
    res.json({ room })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// POST /api/rooms
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, image, floor, capacity, hourlyRate, amenities } = req.body

    if (!name || !description || !image || !floor || !capacity || !hourlyRate) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    const room = await Room.create({
      name,
      description,
      image,
      floor,
      capacity,
      hourlyRate: Number(hourlyRate),
      amenities:  amenities || [],
      ownerId:    req.user.id,
    })

    res.status(201).json({
      message: 'Room added successfully',
      room,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router