const { verifyAccessToken } = require('../services/tokenService');
const ApiError = require('../utils/ApiError');

const verifyRole = (...allowedRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization || req.headers.Authorization;
        const token = authHeader && authHeader.split(' ')[1];

        try {
            const decoded = verifyAccessToken(token);
            const userRole = decoded.UserInfo.role;

            if (!userRole || !allowedRoles.includes(userRole)) {
                return next(new ApiError(403, "Accesso negato: ruolo non autorizzato"));
            }
        } catch (err) {
            return next(new ApiError(403, "Invalid token"));
        }
        next();
    }
}

module.exports = verifyRole;
