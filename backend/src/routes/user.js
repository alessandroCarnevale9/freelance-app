const express = require(`express`)
const {
    loginUser,
    signupUser,
    deleteUser
} = require('../controllers/userController')

const {
    validateUser,
} = require('../middlewares/userValidation')

const router = express.Router()

// login route
router.post(`/login`, loginUser)

// signup route
router.post(`/signup`, validateUser, signupUser)

// delete route
router.delete('/:id', deleteUser)

// TO DO...

// router.get(`/hello`, (req, res) => {
//     res.json({msg: "Hello"})
// })

module.exports = router
