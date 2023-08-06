const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const { verifyToken } = require('../config/jwtToken');

const authMiddleware = asyncHandler(async (req, res, next) => {
    try {
        if (req?.headers?.authorization?.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            if (!token) throw new Error('Token is missing.');
            const decode = await verifyToken(token);
            if (!decode) {
                throw new Error('decode failed ');
            }
            const user = await User.findById(decode.id);
            if (!user) throw new Error('User not found.');
            req.user = user;
            next();
        } else {
            throw new Error('Invalid token format.');
        }
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({
                name: err.name,
                status: 401,
                message: 'Token has expired.',
            });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                name: err.name,
                status: 401,
                message: 'Invalid token.',
            });
        } else {
            return res.status(401).json({
                name: err.name,
                status: 401,
                message: 'Unauthorized',
            });
        }
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });
    if (adminUser.role !== 'admin') {
        throw new Error('YO, YOU ARE NOT THE ADMIN!!');
    } else {
        next();
    }
});

module.exports = { authMiddleware, isAdmin };
