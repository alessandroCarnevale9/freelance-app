const User = require('../models/UserModel')
const ApiError = require('../utils/ApiError')
const bcrypt = require('bcrypt')

const {
    generateAccessToken,
    generateRefreshToken,
    attachRefreshTokenCookie,
    verifyRefreshToken,
    clearRefreshTokenCookie
} = require('../services/tokenService')

// login user
const login = async (req, res) => {
    const { email, password } = req.body

    if(!email || !password)
        throw new ApiError(404, 'All fields are required')

    const foundUser = await User.findOne({ email }).exec()

    if(!foundUser || !foundUser.isActive)
        throw new ApiError(401, 'Unauthorized')

    const match = await bcrypt.compare(password, foundUser.password)
    if(!match)
        throw new ApiError(401, 'Unauthorized')

    const payload = {
        UserInfo: {
            id: foundUser._id.toString(),
            email: foundUser.email,
            role: foundUser.role
        }
    }

    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)
    attachRefreshTokenCookie(res, refreshToken)

    res.status(201).json({ accessToken })
}

const refresh = async (req, res) => {
    const token = req.cookies?.jwt
    if(!token)
        throw new ApiError(401, 'Unauthorized')

    let decoded
    try {
        decoded = verifyRefreshToken(token)
    } catch (err) {
        clearRefreshTokenCookie(res)
        throw new ApiError(403, 'Forbidden')
    }

    const foundUser = await User.findById(decoded.UserInfo.id).exec()
    if(!foundUser) {
        clearRefreshTokenCookie(res)
        throw new ApiError(401, 'Unauthorized')
    }

    const payload = {
        UserInfo: {
            id: foundUser._id.toString(),
            email: foundUser.email,
            role: foundUser.role
        }
    }

    const accessToken = generateAccessToken(payload)
    attachRefreshTokenCookie(res, token)

    res.status(201).json({ accessToken })
}

const logout = async (req, res) => {
    if(!req.cookies?.jwt)
        return res.sendStatus(204)

    clearRefreshTokenCookie(res)
    res.sendStatus(204)
}

module.exports = {
    login,
    refresh,
    logout
}
