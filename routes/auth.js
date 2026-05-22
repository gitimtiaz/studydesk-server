const router = require('express').Router()

router.get('/health', (req, res) => res.json({ message: 'Auth routes ready' }))

module.exports = router