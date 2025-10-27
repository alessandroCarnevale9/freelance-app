const express = require('express')
const {login, refresh, logout} = require('../controllers/authController')
const loginLimiter = require('../middlewares/loginLimiter')

const router = express.Router()

router.post('/', loginLimiter, login)
router.get('/refresh', refresh)
router.post('/logout', logout)

module.exports = router
