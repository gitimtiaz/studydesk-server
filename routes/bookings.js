const router = require('express').Router()

router.get('/health', (req, res) => res.json({ message: 'Bookings routes ready' }))

module.exports = router