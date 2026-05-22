const router  = require('express').Router()
const Booking = require('../models/Booking')
const Room    = require('../models/Room')
const User    = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

// POST /api/bookings
// Private. Book a room with conflict detection.
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, totalCost, note } = req.body

    if (!roomId || !date || !startTime || !endTime || !totalCost) {
      return res.status(400).json({ message: 'All booking fields are required' })
    }

    // Check room exists
    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    // Conflict check
    // Block if any confirmed booking on same room+date overlaps the slot
    const conflict = await Booking.findOne({
      room:   roomId,
      date,
      status: 'confirmed',
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    })

    if (conflict) {
      return res.status(409).json({
        message: `This room is already booked from ${conflict.startTime} to ${conflict.endTime} on ${date}. Please choose a different time.`,
      })
    }

    // Create booking
    const booking = await Booking.create({
      room:      roomId,
      userId:    req.user.id,
      date,
      startTime,
      endTime,
      totalCost: Number(totalCost),
      note:      note || '',
      status:    'confirmed',
    })

    // $push booking id into user's bookings array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { bookings: booking._id },
    })

    // Increment room bookingCount
    await Room.findByIdAndUpdate(roomId, {
      $inc: { bookingCount: 1 },
    })

    // Populate room data before sending back
    const populated = await booking.populate('room', 'name image floor hourlyRate')

    res.status(201).json({
      message: 'Room booked successfully!',
      booking: populated,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router