'use strict'

const crypto = require('crypto')
const asyncHandler = require('express-async-handler')

const { generateToken, generateRefreshToken, verifyRefreshToken, addToBlacklist } = require('../config/jwtToken')
const validateMongooseDbId = require('../utils/validateMongooseDbId')
const User = require('../models/userModel')
const Cart = require('../models/cartModel')
const { sendEmail } = require('./emailCtrl')
const RedisService = require('../service/redisService')

const { checkRefreshToken, deleteCartIdCookie } = require('../utils')
const { mergeCarts } = require('../service/cartService')
const { findModelByIdAndUpdate, createModel, findOneModel, findModelById } = require('../models/repositories/modelRepo')
const { ForbiddenError, NotFoundError, AuthFailureError } = require('../core/errorResponse')

///create user
const createUser = asyncHandler(async (req, res, next) => {
   try {
      const newUser = await createModel({ model: User, data: req.body })
      res.json(newUser)
   } catch (err) {
      next(err)
   }
})

///login user
const login = asyncHandler(async (req, res, next) => {
   try {
      const { email, password } = req.body
      //if user exists or not
      const findUser = await findOneModel({ model: User, conditions: { email: email } })
      if (!findUser) {
         throw new NotFoundError('Invalid Credentials')
      }
      if (findUser && (await findUser.isPasswordMatched(password))) {
         const accessToken = await generateToken(findUser?._id)
         const refreshToken = await generateRefreshToken(findUser?._id)
         await findModelByIdAndUpdate({
            model: User,
            id: findUser._id,
            payload: {
               token: accessToken,
            },
         })

         await mergeCarts(req, findUser._id)
         await deleteCartIdCookie(res)

         res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60, // 30 days
            secure: true,
            sameSite: 'none',
            path: '/',
         })
         res.json({
            _id: findUser?._id,
            first_name: findUser?.first_name,
            last_name: findUser?.last_name,
            // role: findUser?.role,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: accessToken,
         })
      } else {
         throw new ForbiddenError('Invalid Credentials')
      }
   } catch (err) {
      next(err)
   }
})

const checkIsLogin = asyncHandler(async (req, res, next) => {
   const { isLoggedIn, verify, token } = await checkRefreshToken(req)

   if (!isLoggedIn) {
      throw new AuthFailureError()
   }
   try {
      console.log(isLoggedIn)
      const { id } = verify
      const user = await User.findOne({ _id: id }).lean()
      if (!user) {
         throw new NotFoundError('user not found.')
      }
      res.json({
         isLogin: isLoggedIn,
         refreshToken: token,
         user: {
            _id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            mobile: user.mobile,
            token: user.token,
         },
      })
   } catch (err) {
      next(err)
   }
})

//update a user
const updateAUser = asyncHandler(async (req, res, next) => {
   const { _id } = req.user
   validateMongooseDbId(_id)
   try {
      const newUpdate = await findModelByIdAndUpdate({
         model: User,
         id: _id,
         payload: {
            first_name: req?.body?.first_name,
            last_name: req?.body?.last_name,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
         },
      })

      res.json(newUpdate)
   } catch (error) {
      next(error)
   }
})

// save address user
const saveAddress = asyncHandler(async (req, res, next) => {
   const { _id } = req.user
   validateMongooseDbId(_id)
   try {
      const newUpdate = await findModelByIdAndUpdate({
         model: User,
         id: _id,
         payload: {
            address: req?.body?.address,
         },
      })

      res.json(newUpdate)

      res.json(newAddress)
   } catch (error) {
      next(error)
   }
})

///handle refresh token
const refreshToken = asyncHandler(async (req, res, next) => {
   try {
      const cookie = req.cookies
      const refreshToken = cookie?.refreshToken
      if (!refreshToken) {
         throw new NotFoundError('no refresh token in cookie')
      }
      const { id } = await verifyRefreshToken(refreshToken)

      const user = await User.findOne({ _id: id })
      if (!user) {
         throw new NotFoundError('Can not find user')
      }
      //add to blacklist
      await addToBlacklist(user.token)

      const newToken = await generateToken(user?._id)
      await findModelByIdAndUpdate({
         model: User,
         id,
         payload: {
            token: newToken,
         },
      })

      res.json({ token: newToken })
   } catch (err) {
      next(err)
   }
})

// handle logout
const logOut = asyncHandler(async (req, res, next) => {
   try {
      const cookie = req.cookies
      const refreshToken = cookie?.refreshToken
      if (!refreshToken) {
         throw new NotFoundError('no refresh token in cookie')
      }
      const { id } = await verifyRefreshToken(refreshToken)

      //add to blacklist
      await addToBlacklist(refreshToken)

      await RedisService.Del(id.toString())
      const { token } = await findOneModel({ model: User, conditions: { _id: id } })

      // add to blacklist
      await addToBlacklist(token)

      // res.clearCookie('refreshToken', {
      //    httpOnly: true,
      //    secure: true,
      //    path: '/',
      // })
      res.json('Logged Out')
   } catch (err) {
      next(err)
   }
})

/// update password
const updatePassword = asyncHandler(async (req, res, next) => {
   try {
      const { _id } = req.user
      const { password } = req.body
      validateMongooseDbId(_id)
      const user = await findModelById({ model: User, id: _id })

      if (password) {
         user.password = password
         const updatePassword = await user.save()
         res.json(updatePassword)
      } else {
         res.json(user)
      }
   } catch (err) {
      next(err)
   }
})

/// forgot password token
const forgotPasswordToken = asyncHandler(async (req, res, next) => {
   const { email, mobile } = req.body
   const user = await findOneModel({ model: User, conditions: { email } })
   const phoneNumber = await findOneModel({ model: User, conditions: { mobile } })
   if (!user) {
      throw new NotFoundError('User not invalid or not found.')
   }
   if (!phoneNumber) {
      throw new NotFoundError('Phone number invalid or not found.')
   }
   try {
      const token = await user.createPasswordResetToken()
      user.save()
      // const path = process.env.BACK_END_URL
      const path = 'xpj-commerce.vercel.app'
      const resetURL = `Hi, please follow this link to reset your password, this link is valid till 10 minutes from now.
         <a href='${path}/reset-password/${token}'>Click hear!</a>`
      const data = {
         to: email,
         text: 'Hi there!!',
         subject: 'Forgot password link',
         htm: resetURL,
      }
      res.json({ token: token })
      sendEmail(data)
   } catch (err) {
      next(err)
   }
})

///reset password
const resetPassword = asyncHandler(async (req, res, next) => {
   try {
      const { password } = req.body
      const { token } = req.params
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex')
      const user = await findOneModel({
         model: User,
         conditions: {
            passwordResetToken: hashedToken,
            // passwordResetExpires: { $gt: Date.now() },
         },
      })
      if (!user) {
         throw new NotFoundError('invalid token expired, try again later')
      }
      user.password = password
      user.passwordResetToken = undefined
      user.passwordResetExpires = undefined
      await user.save()
      res.json(user)
   } catch (err) {
      next(err)
   }
})

//get wishlist
const getWishlist = asyncHandler(async (req, res) => {
   const { _id } = req.user
   validateMongooseDbId(_id)
   try {
      const findUser = await User.findById(_id).populate('wishlist')
      res.json(findUser.wishlist)
   } catch (err) {
      throw new Error(err)
   }
})

// empty cart

const emptyCart = asyncHandler(async (req, res) => {
   const { _id } = req.user
   validateMongooseDbId(_id)
   try {
      const deleteCart = await Cart.deleteMany({ userId: _id })
      res.json(deleteCart)
   } catch (err) {
      throw new Error(err)
   }
})

module.exports = {
   createUser,
   createUser,
   login,
   refreshToken,
   updateAUser,
   logOut,
   updatePassword,
   forgotPasswordToken,
   resetPassword,
   getWishlist,
   saveAddress,
   emptyCart,
   checkIsLogin,
}
