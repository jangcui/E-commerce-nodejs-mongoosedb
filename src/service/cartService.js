'use strict'

const Product = require('../models/productModel')
const Color = require('../models/colorModel')
const Cart = require('../models/cartModel')
const { NotFoundError, BadRequestError } = require('../core/errorResponse')
const { convertObjectToString, parseStringFromObject, createCartIdCookie, getCartIdFromCookie } = require('../utils')
const validateMongooseDbId = require('../utils/validateMongooseDbId')
const { findModelById, findOneModel, findOneModelAndUpdate, createModel } = require('../models/repositories/modelRepo')
const RedisService = require('../service/redisService')

//redis functions

const delProductInCartRedis = async (req, res) => {
   const { productId, colorId } = req.body
   const product = convertObjectToString({ productId, colorId })
   const cartGuestId = getCartIdFromCookie(req)
   console.log('cartGuestId::', cartGuestId)

   if (!cartGuestId) {
      throw new NotFoundError('Not found user cart in cookie!')
   }
   const getProductInCart = await RedisService.hGet(`cart_guest:${cartGuestId}`, product)
   if (!getProductInCart) {
      throw new NotFoundError('Product not found in cart!')
   }

   await RedisService.hDel(`cart_guest:${cartGuestId}`, product)
}

const addToCartRedis = async (req, res) => {
   const { productId, colorId, quantity } = req.body
   const EXPIRE = 6 * 30 * 24 * 60 * 60 // 6 months

   if (quantity < 0) {
      throw new BadRequestError('Invalid quantity')
   }

   const foundProduct = await findModelById({ model: Product, id: productId })
   if (!foundProduct) {
      throw new NotFoundError('Product not exist or not found!')
   }
   const colorExistInProduct = foundProduct.color.find((color) => color.toString() === colorId)
   if (!colorExistInProduct) throw new NotFoundError('Color not exist in product.')

   const productString = convertObjectToString({ productId, colorId })
   const cartGuestId = getCartIdFromCookie(req)
   if (!cartGuestId) {
      const newCartGuestId = await createCartIdCookie(req, res)
      await RedisService.hSet(`cart_guest:${newCartGuestId}`, productString, quantity, EXPIRE)
      return 'Created cart in cookie and add new product to cart in Redis.'
   }

   const getProductInCart = await RedisService.hGet(`cart_guest:${cartGuestId}`, productString)
   if (!getProductInCart) {
      await RedisService.hSet(`cart_guest:${cartGuestId}`, productString, quantity, EXPIRE)
      return 'Added new product to cart in Redis.'
   }

   await RedisService.hSet(`cart_guest:${cartGuestId}`, productString, quantity, EXPIRE)

   return 'Updated quantity product to cart in Redis.'
}

const updateQuantityProductCartRedis = async (req) => {
   const { productId, colorId, quantity } = req.body

   const foundProduct = await findModelById({ model: Product, id: productId })
   if (!foundProduct) {
      throw new NotFoundError('Product not exist or not found!')
   }
   const colorExistInProduct = foundProduct.color.find((color) => color.toString() === colorId)
   if (!colorExistInProduct) throw new NotFoundError('Color not exist in product.')
   const productString = convertObjectToString({ productId, colorId })
   // const isProductExist = await RedisService.hGet(`cart_guest:${cart_guest}`, productString)
   const cartGuestId = getCartIdFromCookie(req)

   if (quantity <= 0 || !quantity) {
      return await RedisService.hDel(`cart_guest:${cartGuestId}`, productString)
   }
   const finalQuantity = Math.max(quantity, 0)
   await RedisService.hSet(`cart_guest:${cartGuestId}`, productString, finalQuantity)

   return 'Updated quantity product to cart in Redis.'
}

const getAllCartRedis = async (req) => {
   const cartGuestId = getCartIdFromCookie(req)

   const cartData = await RedisService.hGetAll(`cart_guest:${cartGuestId}`)
   // if (!cartData) return []
   if (!cartData) {
      return { cart_products: [], total_price: 0, quantity: 0 }
   }

   // const updatedTotalPrice = (foundProduct.price_after_discount || foundProduct.price) * updatedQuantity
   let prices = []
   const getData = await Promise.all(
      Object.entries(cartData).map(async ([key, value]) => {
         const { productId, colorId } = parseStringFromObject(key)
         const productDetails = await getProductDetails(productId, colorId)
         const totalPrice = (productDetails.product.price_after_discount || productDetails.product.price) * value
         prices.push(totalPrice)
         return { ...productDetails, quantity: parseStringFromObject(value) }
      }),
   )
   const sumWithInitial = prices.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
   return { cart_products: getData || [], total_price: sumWithInitial, quantity: getData.length }
}

//mongodb functions

const getAllCartMongo = async (userId) => {
   validateMongooseDbId(userId)
   const findCart = await findOneModel({
      model: Cart,
      conditions: { cart_userId: userId },
      // populateFields: ['cart_products.productId', 'cart_products.colorId'],
   })
   if (!findCart) {
      return { _id: userId, cart_products: [], total_price: 0 }
   }
   const productList = await Promise.all(
      findCart?.cart_products?.map(async (data) => {
         const { productId, colorId } = data
         const productDetails = await getProductDetails(productId, colorId)
         return { ...productDetails, quantity: data.quantity }
      }),
   )

   return { _id: findCart._id, cart_products: productList, total_price: findCart.cart_total_price.toFixed(2) }
}

const getProductDetails = async (productId, colorId) => {
   const foundProduct = await findModelById({ model: Product, id: productId })
   if (!foundProduct) {
      throw new NotFoundError('Product not exist or not found!')
   }

   const foundColor = await findModelById({ model: Color, id: colorId })
   if (!foundColor) {
      throw new NotFoundError('Color not found!')
   }

   return {
      product: {
         _id: foundProduct?._id,
         title: foundProduct?.title,
         slug: foundProduct?.slug,
         discountCode: foundProduct?.discountCode || null || '',
         price_after_discount: foundProduct?.price_after_discount,
         price: foundProduct?.price,
         thumb: foundProduct?.thumb,
      },
      color: { title: foundColor.title, _id: colorId },
   }
}

const handleCreateUserCart = async ({ cart_userId }) => {
   const data = {
      cart_userId,
      cart_state: 'active',
      cart_products: [],
      cart_total_price: 0,
   }
   return await createModel({ model: Cart, data: data })
}

const handleAddToCart = async ({ userId, productId, quantity, colorId }) => {
   const foundProduct = await findModelById({ model: Product, id: productId })
   if (!foundProduct) throw new NotFoundError('Product not found')
   // const updatedTotalPrice = (foundProduct.price_after_discount || foundProduct.price) * updatedQuantity

   const query = { cart_userId: userId },
      updateSet = {
         $addToSet: {
            cart_products: { productId, quantity, colorId },
         },
      }
   await findOneModelAndUpdate({ condition: query, payload: updateSet, model: Cart })
   return await updateCartTotalPrice({ userId })
}

const updateCartTotalPrice = async ({ userId }) => {
   const query = { cart_userId: userId }

   const foundCart = await findOneModel({
      model: Cart,
      conditions: query,
      populateFields: ['cart_products.productId', 'cart_products.colorId'],
   })
   if (!foundCart) throw new NotFoundError('Cart not found')

   let total = 0
   for (const product of foundCart.cart_products) {
      const productPrice = product.productId.price_after_discount || product.productId.price
      total += productPrice * product.quantity
   }
   return await findOneModelAndUpdate({
      model: Cart,
      condition: query,
      payload: { $set: { cart_total_price: total.toFixed(2) } },
   })
}

const updateQuantityProductCartMongo = async (req, { userId }) => {
   const { productId, colorId, quantity } = req.body

   if (quantity < 0) {
      throw new BadRequestError('Invalid quantity!')
   }
   const foundCart = await findOneModel({ model: Cart, conditions: { cart_userId: userId } })
   if (!foundCart) {
      throw new NotFoundError('Cart not found.')
   }
   const updateIndex = foundCart.cart_products.findIndex(
      (item) => item.productId.equals(productId) && item.colorId.equals(colorId),
   )
   if (updateIndex === -1) {
      throw new NotFoundError("Product not found in the user's cart")
   }
   foundCart.cart_products[updateIndex].quantity = quantity
   await foundCart.save()
   return await updateCartTotalPrice({ userId })
}

const delProductInCartMongo = async (req, { userId }) => {
   const { productId, colorId } = req.body

   const query = { cart_userId: userId }
   const foundCart = await findOneModel({
      model: Cart,
      conditions: query,
   })
   if (!foundCart) throw new NotFoundError('Cart not found.')
   foundCart.cart_products = foundCart.cart_products.filter(
      (item) => !(item.productId.toString() === productId && item.colorId.toString() === colorId),
   )
   await foundCart.save()
   return await updateCartTotalPrice({ userId })
}

const checkProductExist = (cart, productId) =>
   !!cart.cart_products.find((product) => product.productId.toString() === productId)

const addToCartMongo = async (req, { userId }) => {
   const { productId, colorId, quantity } = req.body

   if (quantity < 0) {
      throw new BadRequestError('Invalid quantity!')
   }
   // const { isLoggedIn, verify } = await checkRefreshToken()
   //Check product exist in cart?
   const foundProduct = await findModelById({ model: Product, id: productId })
   if (!foundProduct) throw new NotFoundError('Product not exist or found.')
   // Check color exist in product?
   const foundColor = foundProduct.color.find((color) => color.toString() === colorId)
   if (!foundColor) throw new NotFoundError('Color not exist in product.')
   //Check is user cart exist?
   const userCart = await findOneModel({ model: Cart, conditions: { cart_userId: userId } })
   // if exists => add new product to cart. Otherwise => create user cart -> add new product to cart
   if (!userCart) {
      const createCart = await handleCreateUserCart({ cart_userId: userId })
      //Check product exist in cart?
      const existingProduct = checkProductExist(createCart, productId)
      // if non-existent => add new. Otherwise => change quantity
      if (existingProduct) {
         // change quantity product
         return await updateQuantityProductCartMongo({ userId, productId, colorId, quantity })
      } else {
         //add new product
         return await handleAddToCart({ userId, productId, quantity, colorId })
      }
   }

   //Check product exist?
   const existingProduct = checkProductExist(userCart, productId)
   // if non-existent => add new. Otherwise => change quantity
   if (existingProduct) {
      // change quantity product
      return await updateQuantityProductCartMongo({ userId, productId, colorId, quantity })
   } else {
      //add new product
      return await handleAddToCart({ userId, productId, quantity, colorId })
   }
}

const mergeCarts = async (req, userId) => {
   const cartGuestId = getCartIdFromCookie(req)

   let cartArray = []
   const foundCartRedis = await RedisService.hGetAll(`cart_guest:${cartGuestId}`)
   if (foundCartRedis) {
      for (const [key, value] of Object.entries(foundCartRedis)) {
         const { productId, colorId } = parseStringFromObject(key)
         cartArray.push({ productId, colorId, quantity: parseStringFromObject(value) })
      }
   }
   const foundUserCart = await findOneModel({ model: Cart, conditions: { cart_userId: userId } })
   if (!foundUserCart) {
      const createCart = await handleCreateUserCart({ cart_userId: userId })
      createCart.cart_products = cartArray
      return createCart.save()
   }
   cartArray.forEach((newItem) => {
      const existingItem = foundUserCart.cart_products.find(
         (item) => item.productId.equals(newItem.productId) && item.colorId.equals(newItem.colorId),
      )
      if (existingItem) {
         existingItem.quantity += newItem.quantity
      } else {
         foundUserCart.cart_products.push(newItem)
      }
   })
   await foundUserCart.save()
   await RedisService.Del(`cart_guest:${cartGuestId}`)

   return foundUserCart
}

module.exports = {
   addToCartMongo,
   addToCartRedis,
   getAllCartRedis,
   getAllCartMongo,
   delProductInCartRedis,
   delProductInCartMongo,
   updateQuantityProductCartRedis,
   updateQuantityProductCartMongo,
   mergeCarts,
   updateCartTotalPrice,
}
