const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')
const { verifyToken, verifyRefreshToken } = require('../config/jwtToken')
const { NotFoundError, AuthFailureError } = require('../core/errorResponse')

const authMiddleware = asyncHandler(async (req, res, next) => {
   try {
      let token, decode

      if (req?.headers?.authorization?.startsWith('Bearer')) {
         token = req.headers.authorization.split(' ')[1]
      } else if (req?.cookies) {
         token = req?.cookies?.refreshToken
      } else {
         return next() // No token found, move to the next middleware
      }

      if (!token) {
         throw new AuthFailureError('Token is missing.')
      }

      decode = await verifyToken(token)
      if (!decode) {
         throw new AuthFailureError('Token verification failed.')
      }

      const user = await User.findById(decode.id)
      if (!user) {
         throw new NotFoundError('User not found.')
      }

      req.user = user
      next()
   } catch (err) {
      if (err.name === 'TokenExpiredError') {
         throw new AuthFailureError('TokenExpiredError')
      } else if (err.name === 'JsonWebTokenError') {
         throw new AuthFailureError('JsonWebTokenError')
      } else {
         throw new AuthFailureError(err.message || 'Unauthorized')
      }
   }
})

const isAdmin = asyncHandler(async (req, res, next) => {
   const { email } = req.user
   const adminUser = await User.findOne({ email })
   if (adminUser.role !== 'admin') {
      throw new AuthFailureError('YO, YOU ARE NOT THE ADMIN!!')
   } else {
      next()
   }
})

module.exports = { authMiddleware, isAdmin }
