'use strict'

const _ = require('lodash')
const mongoose = require('mongoose') // Erase if already required
const { verifyRefreshToken } = require('../config/jwtToken')
const crypto = require('crypto')
const cookie = require('cookie')

////////

const createCartIdCookie = async (req, res) => {
   const EXPIRE = 6 * 30 * 24 * 60 * 60 // 6 months

   const randomId = crypto.randomBytes(10).toString('hex')
   const serializedCookie = cookie.serialize('cart_id_guest', randomId, {
      httpOnly: true,
      maxAge: EXPIRE,
      secure: true,
      sameSite: 'none',
      path: '/api',
   })

   // set response http
   await res.setHeader('Set-Cookie', serializedCookie)
   return randomId
}
const getCartIdFromCookie = (req) => {
   try {
      const cookies = cookie.parse(req.headers.cookie || '')

      const cartId = cookies.cart_id_guest || null

      return cartId
   } catch (error) {
      return null
   }
}

const deleteCartIdCookie = async (res) => {
   const emptyCookie = cookie.serialize('cart_id_guest', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/api',
      secure: true,
      sameSite: 'none',
   })

   await res.setHeader('Set-Cookie', emptyCookie)
}
const deleteRefreshTokenInCookie = async (res) => {
   const emptyCookie = cookie.serialize('refreshToken', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/api',
   })

   await res.setHeader('Set-Cookie', emptyCookie)
}

const checkRefreshToken = async (req) => {
   try {
      const cookie = req.cookies
      const refreshToken = cookie?.refreshToken
      if (!refreshToken) {
         return { isLoggedIn: false, token: null }
      }

      const verify = await verifyRefreshToken(refreshToken)
      if (!verify) {
         return { isLoggedIn: false, token: null }
      }
      return { isLoggedIn: true, token: refreshToken, verify }
   } catch (error) {
      return { isLoggedIn: false, token: null }
   }
}

const convertToObjectIdMongodb = (id) => new mongoose.Types.ObjectId(id)

function convertObjectToString(obj) {
   try {
      const jsonString = JSON.stringify(obj)
      return jsonString
   } catch (error) {
      console.error('Error converting object to string:', error)
      return null
   }
}

function parseStringFromObject(jsonString) {
   try {
      const parsedObject = JSON.parse(jsonString)
      return parsedObject
   } catch (error) {
      console.error('Error converting string to object:', error)
      return null
   }
}

const getInfoData = ({ fields = [], object = {} }) => {
   return _.pick(object, fields)
}

const getSelectData = (select = []) => {
   return Object.fromEntries(select.map((el) => [el, 1])) // ['a','b'] => { a:1, b:1 }
}

const unGetSelectData = (select = []) => {
   return Object.fromEntries(select.map((el) => [el, 0])) // ['a','b'] => { a:0, b:0 }
}

const removeUndefinedObject = (obj) => {
   Object.keys(obj).forEach((k) => {
      if (obj[k] == null) {
         delete obj[k]
      }
   })
   return obj
}

const updateNestedObjectParser = (obj, parent, result = {}) => {
   Object.keys(obj).forEach((k) => {
      const propName = parent ? `${parent}.${k}` : k
      if (typeof obj[k] == 'object' && !Array.isArray(obj[k])) {
         updateNestedObjectParser(obj[k], propName, result)
      } else {
         result[propName] = obj[k]
      }
   })

   return result
}

module.exports = {
   convertToObjectIdMongodb,
   getInfoData,
   getSelectData,
   unGetSelectData,
   removeUndefinedObject,
   updateNestedObjectParser,
   checkRefreshToken,
   convertObjectToString,
   parseStringFromObject,
   createCartIdCookie,
   getCartIdFromCookie,
   deleteCartIdCookie,
   deleteRefreshTokenInCookie,
}
