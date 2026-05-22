const mongoose = require('mongoose')

const bookingSchema = new mongoose.Schema(
  {
    room:      { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date:      { type: String, required: true },
    startTime: { type: String, required: true },
    endTime:   { type: String, required: true },
    totalCost: { type: Number, required: true },
    note:      { type: String, default: '' },
    status:    { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Booking', bookingSchema)