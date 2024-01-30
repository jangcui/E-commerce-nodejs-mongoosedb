'use strict'

const asyncHandler = require('express-async-handler')
const { generateToken, generateRefreshToken, verifyRefreshToken, addToBlacklist } = require('../config/jwtToken')
const validateMongooseDbId = require('../utils/validateMongooseDbId')
const User = require('../models/userModel')
const Order = require('../models/orderModel')
const client = require('../config/redisConnection')
const { NotFoundError } = require('../core/errorResponse')

///login admin
const login = asyncHandler(async (req, res) => {
   const { email, password } = req.body
   //if admin exists or not
   const findAdmin = await User.findOne({ email })
   if (!findAdmin) {
      throw new Error('Invalid Credentials')
   }
   if (findAdmin.role !== 'admin') {
      throw new Error('Your are not admin')
   }

   if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
      const accessToken = await generateToken(findAdmin?._id)
      const refreshToken = await generateRefreshToken(findAdmin?._id)
      const updateAdmin = await User.findByIdAndUpdate(
         findAdmin?._id,
         {
            token: accessToken,
         },
         {
            new: true,
         },
      )
      res.cookie('adminToken', refreshToken, {
         httpOnly: true,
         maxAge: 30 * 24 * 60 * 60,
         secure: true,
         sameSite: 'none',
      })
      res.json({
         _id: findAdmin?._id,
         first_name: findAdmin?.first_name,
         last_name: findAdmin?.last_name,
         email: findAdmin?.email,
         // role: findAdmin?.role,
         mobile: findAdmin?.mobile,
         token: accessToken,
      })
   } else {
      throw new Error('Invalid Credentials')
   }
})

///get all user
const getAllUser = asyncHandler(async (req, res, next) => {
   try {
      const getUsers = await User.find({ isDelete: { $ne: true } })
      res.json(getUsers)
   } catch (error) {
      next(error)
   }
})

//get a user
const getAUser = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const getUser = await User.findById(id)
      res.json(getUser)
   } catch (error) {
      throw new Error(error)
   }
})

// add to trash bin
const toggleUserToTrashBin = asyncHandler(async (req, res, next) => {
   const { id } = req.params
   validateMongooseDbId(id)

   try {
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + 10)
      const user = await User.findById(id)
      const isDeleted = user.isDelete || false
      const userUpdate = await User.findByIdAndUpdate(id, { isDelete: !isDeleted, deleteDate: deadline }, { new: true })
      res.json(userUpdate)
   } catch (err) {
      next(err)
   }
})

//delete a user
const deleteAUser = asyncHandler(async (req, res, next) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const isUser = await User.findOne({ _id: id })
      if (!isUser) {
         throw new Error('This user was not found or has been deleted')
      }
      const deleteAUser = await User.findByIdAndDelete({ _id: id })
      res.json({ message: 'Deleted.' })
   } catch (err) {
      next(err)
   }
})

///handle refresh token
const refreshToken = asyncHandler(async (req, res, next) => {
   try {
      const cookie = req.cookies
      const adminToken = cookie?.adminToken

      if (!adminToken) {
         throw new Error('no refresh token in cookie')
      }
      const { id } = await verifyRefreshToken(adminToken)

      const user = await User.findOne({ _id: id })
      if (!user) {
         throw new Error('Can not find user')
      }
      //add to blacklist
      await addToBlacklist(user.token)
      const newToken = await generateToken(user?._id)

      //update ser
      await User.findByIdAndUpdate(
         id,
         {
            token: newToken,
         },
         {
            new: true,
         },
      )

      res.json({ token: newToken })
   } catch (err) {
      next(err)
   }
})

/// check isLogin
const checkIsLoginAdmin = asyncHandler(async (req, res) => {
   const cookie = req.cookies
   const adminToken = cookie?.adminToken

   if (!adminToken) {
      throw new NotFoundError('No refresh token in cookie')
   }
   const { id } = await verifyRefreshToken(adminToken)

   const user = await User.findOne({ _id: id })
   if (!user) {
      throw new NotFoundError('user not found.')
   }
   res.json({
      isLogin: true,
      token: user.token,
      admin: {
         _id: user._id,
         first_name: user.first_name,
         last_name: user.last_name,
         email: user.email,
         mobile: user.mobile,
      },
   })
})

// handle logout
const logOut = asyncHandler(async (req, res, next) => {
   try {
      const cookie = req.cookies
      const adminToken = cookie?.adminToken
      if (!adminToken) {
         throw new Error('no refresh token in cookie')
      }
      const { id } = await verifyRefreshToken(adminToken)
      //add to blacklist
      await addToBlacklist(adminToken)

      client.del(id.toString(), (err, reply) => {
         if (err) throw new Error(err.message)
      })
      const { token } = await User.findOne({ _id: id })

      //add to blacklist
      await addToBlacklist(token)

      res.clearCookie('adminToken', {
         httpOnly: true,
         secure: true,
      })
      res.json(' logged Out')
   } catch (err) {
      next(err)
   }
})

//toggle block user
const toggleBlockUser = asyncHandler(async (req, res, next) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const user = await User.findById(id)
      const isBlocked = user.isBlocked || false
      const updatedUser = await User.findByIdAndUpdate(
         id,
         {
            isBlocked: !isBlocked,
         },
         {
            new: true,
         },
      )
      const message = updatedUser.isBlocked ? 'user blocked' : 'user unblocked'

      res.json({
         message: message,
      })
   } catch (err) {
      next(err)
   }
})

/// update password
const updatePassword = asyncHandler(async (req, res) => {
   const { _id } = req.user
   const { password } = req.body
   validateMongooseDbId(_id)
   const user = await User.findById(_id)
   if (password) {
      user.password = password
      const updatePassword = await user.save()
      res.json(updatePassword)
   } else {
      res.json(user)
   }
})

/// get all orders
const getAllOrders = asyncHandler(async (req, res) => {
   try {
      const orders = await Order.find().populate('user').populate('orderItems.productId').populate('orderItems.color')
      res.json(orders)
   } catch (err) {
      throw new Error(err)
   }
})

//delete order
const deleteOrder = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const myOrder = await Order.findByIdAndDelete(id)
      res.json({ message: 'Deleted.', myOrder })
   } catch (err) {
      throw new Error(err)
   }
})
//update order
const updateOrderStatus = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const order = await Order.findById(id)
      order.order_status = req.body.order_status
      await order.save()
      res.json(order)
   } catch (err) {
      throw new Error(err)
   }
})
//get a order for admin
const getAOrder = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const orders = await Order.findById(id)
         .populate('user')
         .populate('orderItems.productId')
         .populate('orderItems.color')
      res.json(orders)
   } catch (err) {
      throw new Error(err)
   }
})

const getMonthWiseOrderInCome = asyncHandler(async (req, res) => {
   const currentDate = new Date()
   const twelveMonthsAgo = new Date()

   // Thiết lập ngày, tháng và năm cho cách đây 12 tháng
   twelveMonthsAgo.setFullYear(currentDate.getFullYear(), currentDate.getMonth() - 11, currentDate.getDate())

   const data = await Order.aggregate([
      {
         $match: {
            paid_at: {
               $lte: currentDate, // Lấy đơn hàng trước hoặc trong tháng hiện tại
               $gte: twelveMonthsAgo, // Lấy đơn hàng trong vòng 12 tháng gần nhất
            },
         },
      },
      {
         $group: {
            _id: {
               month: { $month: '$paid_at' }, // Nhóm theo tháng
            },
            amount: { $sum: '$total_price_after_discount' },
            count: { $sum: 1 },
         },
      },
   ])

   res.json(data)
})

// get Year total order
const getYearlyTotalOrders = asyncHandler(async (req, res) => {
   const currentDate = new Date()
   const twelveMonthsAgo = new Date()
   twelveMonthsAgo.setMonth(currentDate.getMonth() - 11) // Chỉnh số 11 để lấy 12 tháng trước

   const data = await Order.aggregate([
      {
         $match: {
            paid_at: {
               $lte: currentDate, // Lấy đơn hàng trước hoặc trong tháng hiện tại
               $gte: twelveMonthsAgo, // Lấy đơn hàng trong vòng 12 tháng gần nhất
            },
         },
      },
      {
         $group: {
            _id: null, // Không nhóm theo bất kỳ trường nào (tổng hợp toàn bộ đơn hàng)
            count: { $sum: 1 }, // Tổng số đơn hàng
            amount: { $sum: '$total_price_after_discount' }, // Tổng số tiền
         },
      },
   ])

   res.json(data)
})

module.exports = {
   login,
   getAUser,
   getAllUser,
   deleteAUser,
   logOut,
   refreshToken,
   updatePassword,
   toggleBlockUser,
   toggleUserToTrashBin,
   getMonthWiseOrderInCome,
   getYearlyTotalOrders,
   getAllOrders,
   deleteOrder,
   getAOrder,
   updateOrderStatus,
   checkIsLoginAdmin,
}
