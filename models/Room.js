const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    description:  { type: String, required: true, trim: true },
    image:        { type: String, required: true },
    floor:        { type: String, required: true, trim: true },
    capacity:     { type: String, required: true },  
    hourlyRate:   { type: Number, required: true, min: 1 },
    amenities:    [{ type: String }],                
    bookingCount: { type: Number, default: 0 },
    ownerId:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Room', roomSchema)