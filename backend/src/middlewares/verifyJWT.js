const { verifyAccessToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

const verifyJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        throw new ApiError(401, 'Missing token');
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
        decoded = verifyAccessToken(token);
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            throw new ApiError(401, 'Token expired');
        }
        throw new ApiError(403, 'Invalid token');
    }

    // Popola req con i dati dell'utente dal token
    if (decoded.UserInfo) {
        req.userId = decoded.UserInfo.id;
        req.userAddress = decoded.UserInfo.address;
        req.userRole = decoded.UserInfo.role;
    }

    console.log('verifyJWT success userId=', req.userId);
    next();
};

module.exports = verifyJWT;