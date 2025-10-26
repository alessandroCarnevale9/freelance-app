const express = require('express')
const {login, refresh, logout} = require('../controllers/authController')

const router = express.Router()

router.post('/', login)
router.get('/refresh', refresh)
router.post('/logout', logout)

module.exports = router
