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

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://study-desk-neon.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean)

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, Thunder Client, Render health checks)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    callback(new Error(`CORS blocked: ${origin}`))
  },
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
  res.json({
    message: 'StudyDesk API is running',
    env:     process.env.NODE_ENV || 'development',
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err.message)
  res.status(500).json({ message: err.message || 'Internal server error' })
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