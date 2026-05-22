const express      = require('express')
const mongoose     = require('mongoose')
const cookieParser = require('cookie-parser')
const cors         = require('cors')
require('dotenv').config()

const authRoutes    = require('./routes/auth')
const roomRoutes    = require('./routes/rooms')
const bookingRoutes = require('./routes/bookings')

const app  = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())

// Routes
app.use('/api/auth',     authRoutes)
app.use('/api/rooms',    roomRoutes)
app.use('/api/bookings', bookingRoutes)

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'StudyDesk API is running' })
})

// MongoDB + Start
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })