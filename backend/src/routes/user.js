const express = require(`express`)
const {
    createUser,
    deleteUser
} = require('../controllers/userController')

const {
    validateUser,
} = require('../middlewares/userValidation')

const router = express.Router()

// signup route
router.post(`/signup`, validateUser, createUser)

// delete route
router.delete('/:id', deleteUser)

module.exports = router
