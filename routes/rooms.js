const router = require('express').Router()

router.get('/health', (req, res) => res.json({ message: 'Rooms routes ready' }))

module.exports = router