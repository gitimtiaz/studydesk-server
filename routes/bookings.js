const router  = require('express').Router()
const Booking = require('../models/Booking')
const Room    = require('../models/Room')
const User    = require('../models/User')
const authMiddleware = require('../middleware/authMiddleware')

// POST /api/bookings
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId, date, startTime, endTime, totalCost, note } = req.body

    if (!roomId || !date || !startTime || !endTime || !totalCost) {
      return res.status(400).json({ message: 'All booking fields are required' })
    }

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({ message: 'Room not found' })
    }

    // Conflict check
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

    const populated = await booking.populate('room', 'name image floor hourlyRate')

    res.status(201).json({
      message: 'Room booked successfully!',
      booking: populated,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// GET /api/bookings/my-bookings
// Private. Returns all bookings for the logged-in user.
router.get('/my-bookings', authMiddleware, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.id })
      .populate('room', 'name image floor hourlyRate')
      .sort({ createdAt: -1 })

    res.json({ bookings })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

// PATCH /api/bookings/:id/cancel
// Private. Cancel a booking — only the booking owner can cancel.
router.patch('/:id/cancel', authMiddleware, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden — this is not your booking' })
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' })
    }

    // Update status to cancelled
    booking.status = 'cancelled'
    await booking.save()

    // $pull booking id from user's bookings array
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { bookings: booking._id },
    })

    // Decrement room bookingCount
    await Room.findByIdAndUpdate(booking.room, {
      $inc: { bookingCount: -1 },
    })

    res.json({ message: 'Booking cancelled', booking })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
})

module.exports = router