const { verifyRefreshToken } = require('../services/tokenService')
const ApiError = require('../utils/ApiError')

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization

    if(!authHeader?.startsWith('Bearer ')) {
        throw new ApiError(401, 'Missing token')
    }

    const token = authHeader.split(' ')[1]
    let decoded
    try {
        decoded = verifyRefreshToken(token)
    }
    catch {
        throw new ApiError(403, 'Invalid token')
    }

    if(decoded.UserInfo) {
        req.userId = decoded.id
        req.userEmail = decoded.email
        req.userRole = decoded.role
    }

    console.log('verifyJWT success userId=', req.UserId)
    next()
}

module.exports = verifyJWT
