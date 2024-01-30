'use strict'

// create order
const mongoose = require('mongoose')
const asyncHandler = require('express-async-handler')

const { NotFoundError, BadRequestError } = require('../core/errorResponse')
const Order = require('../models/orderModel')
const Product = require('../models/productModel')
const {
   createModel,
   findModelByIdAndUpdate,
   findOneModel,
   findModelById,
   findModel,
} = require('../models/repositories/modelRepo')
const validateMongooseDbId = require('../utils/validateMongooseDbId')
const Cart = require('../models/cartModel')
const { updateCartTotalPrice } = require('../service/cartService')

const validateAndAddToOrder = async (orderItems) => {
   const orderProducts = []

   for (const orderItem of orderItems) {
      const { productId, quantity, colorId } = orderItem
      const foundProduct = await findModelById({ model: Product, id: productId })

      if (!foundProduct) {
         throw new NotFoundError('Product not exist or not found!')
      }

      if (foundProduct.quantity < quantity) {
         throw new BadRequestError(`Quantity must be smaller than or equal to ${quantity}`)
      }

      orderProducts.push({ productId, quantity, colorId })
   }

   return orderProducts
}
const createOrderMongo = async (
   userId,
   shippingInfo,
   orderProducts,
   paymentInfo,
   total_price,
   total_price_after_discount,
) => {
   const order = await createModel({
      model: Order,
      data: {
         user: userId,
         shippingInfo,
         orderItems: orderProducts,
         paymentInfo,
         total_price,
         total_price_after_discount,
      },
   })

   return order
}
const processOrderAndUpdateCart = async (userId, orderProducts) => {
   const session = await mongoose.startSession()
   session.startTransaction()

   try {
      //handle cart and product
      for (const orderItem of orderProducts) {
         const { productId, quantity, colorId } = orderItem
         const userCart = await findOneModel({ model: Cart, conditions: { cart_userId: userId } })

         const existingProductIndex = userCart.cart_products.findIndex(
            (product) => product.productId.toString() === productId && product.colorId.toString() === colorId,
         )

         if (existingProductIndex !== -1) {
            userCart.cart_products.splice(existingProductIndex, 1)
            await userCart.save()
            await updateCartTotalPrice({ userId })
         }

         await findModelByIdAndUpdate({
            model: Product,
            id: productId,
            payload: {
               $inc: { quantity: -quantity },
            },
         })
      }

      await session.commitTransaction()
      session.endSession()
   } catch (error) {
      // Nếu có lỗi, hủy bỏ giao dịch
      await session.abortTransaction()
      session.endSession()
      throw error
   }
}
const createOrderUser = asyncHandler(async (req, res, next) => {
   const { shippingInfo, orderItems, paymentInfo, total_price, total_price_after_discount } = req.body
   const { _id } = req.user

   try {
      validateMongooseDbId(_id)
      const userId = _id

      const orderProducts = await validateAndAddToOrder(orderItems)
      const order = await createOrderMongo(
         userId,
         shippingInfo,
         orderProducts,
         paymentInfo,
         total_price,
         total_price_after_discount,
      )

      if (order) {
         await processOrderAndUpdateCart(userId, orderProducts)
      }

      res.json({
         orderId: order._id,
         success: true,
      })
   } catch (err) {
      next(err)
   }
})
const getMyOrder = asyncHandler(async (req, res, next) => {
   const { _id } = req.user
   validateMongooseDbId(_id)
   try {
      const order = await findModel({
         conditions: { user: _id },
         model: Order,
         populateFields: ['orderItems.productId', 'orderItems.colorId'],
      })

      if (!order) throw new NotFoundError('order not found')

      res.json(order)
   } catch (err) {
      next(err)
   }
})

module.exports = { createOrderUser, getMyOrder }
