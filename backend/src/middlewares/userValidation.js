const validator = require('validator')
const ApiError = require('../utils/ApiError')

function validateUser(req, res, next) {
  try {
    const { email, password } = req.body ?? {}

    if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password.trim()) {
      return next(new ApiError(400, 'All fields must be filled.'))
    }

    if (!validator.isEmail(email)) {
      return next(new ApiError(400, 'Email is not valid.'))
    }

    const strong = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })

    if (!strong) {
      return next(new ApiError(400, 'Password not strong enough.'))
    }

    return next()
  } catch (err) {
    return next(err)
  }
}

module.exports = { validateUser }