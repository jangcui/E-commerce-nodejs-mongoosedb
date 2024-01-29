'use strict'

const asyncHandler = require('express-async-handler')

const { SuccessResponse } = require('../core/successResponse')
const {
   getAllCartMongo,
   getAllCartRedis,
   addToCartRedis,
   addToCartMongo,
   delProductInCartMongo,
   delProductInCartRedis,
   updateQuantityProductCartRedis,
   updateQuantityProductCartMongo,
} = require('../service/cartService')
const { checkRefreshToken, getCartIdFromCookie } = require('../utils')

const addToCart = asyncHandler(async (req, res, next) => {
   try {
      const { isLoggedIn, verify } = await checkRefreshToken(req)
      console.log('isLoggedIn::', isLoggedIn)

      if (isLoggedIn) {
         const { id } = verify
         return new SuccessResponse({
            message: 'Product added to Mongoose db.',
            metadata: await addToCartMongo(req, { userId: id }),
         }).send(res)
      } else {
         return new SuccessResponse({
            message: 'Product added to Redis db.',
            metadata: await addToCartRedis(req, res),
         }).send(res)
      }
   } catch (err) {
      next(err)
   }
})

const getAllCart = asyncHandler(async (req, res, next) => {
   const { isLoggedIn, verify } = await checkRefreshToken(req)
   getCartIdFromCookie(req)
   try {
      if (isLoggedIn) {
         const { id } = verify
         return new SuccessResponse({
            message: 'Get all product from cart Mongoose Db.',
            metadata: await getAllCartMongo(id),
         }).send(res)
      } else {
         return new SuccessResponse({
            message: 'Get all product from cart Redis.',
            metadata: await getAllCartRedis(req),
         }).send(res)
      }
   } catch (err) {
      next(err)
   }
})

const deleteProductInCart = asyncHandler(async (req, res, next) => {
   const { isLoggedIn, verify } = await checkRefreshToken(req)
   try {
      if (isLoggedIn) {
         const { id } = verify
         return new SuccessResponse({
            message: 'Deleted product in cart Mongoose db',
            metadata: await delProductInCartMongo(req, { userId: id }),
         }).send(res)
      } else {
         return new SuccessResponse({
            message: 'Deleted product in cart Redis db',
            metadata: await delProductInCartRedis(req, res),
         }).send(res)
      }
   } catch (err) {
      next(err)
   }
})

const updateQuantityCart = asyncHandler(async (req, res, next) => {
   const { isLoggedIn, verify } = await checkRefreshToken(req)
   try {
      if (isLoggedIn) {
         const { id } = verify
         return new SuccessResponse({
            message: 'Updated quantity in cart Mongo db',
            metadata: await updateQuantityProductCartMongo(req, { userId: id }),
         }).send(res)
      } else {
         return new SuccessResponse({
            message: 'Updated quantity in cart Redis db',
            metadata: await updateQuantityProductCartRedis(req),
         }).send(res)
      }
   } catch (err) {
      next(err)
   }
})

module.exports = {
   addToCart,
   addToCart,
   getAllCart,
   deleteProductInCart,
   updateQuantityCart,
}
