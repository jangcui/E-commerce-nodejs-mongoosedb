'use strict'

const jwt = require('jsonwebtoken')
const keySecret = process.env.JWT_SECRET
const client = require('./redisConnection')

const generateToken = (id) => {
   return jwt.sign({ id }, keySecret, { expiresIn: '1d' })
}

const addToBlacklist = async (token) => {
   return new Promise((resolve, reject) => {
      // Lưu Access Token vào danh sách blacklist trong Redis và đặt thời hạn sống
      client.set(`blacklist:${token}`, 'true', 'EX', 86400, (err) => {
         if (err) {
            console.error('Error adding token to blacklist in Redis:', err)
            reject(new Error('Failed to add token to blacklist.'))
         } else {
            resolve()
         }
      })
   })
}
const isTokenBlacklisted = async (token) => {
   return new Promise((resolve, reject) => {
      client.get(`blacklist:${token}`, (err, reply) => {
         if (err) {
            console.error('Error retrieving token from Redis:', err)
            reject(new Error('Failed to verify token.'))
         } else if (reply === 'true') {
            resolve(true) // Token nằm trong danh sách blacklist
         } else {
            resolve(false) // Token không nằm trong danh sách blacklist
         }
      })
   })
}
const verifyToken = async (token) => {
   if (!token) {
      throw new Error('Access Token is not provided.')
   }
   // Kiểm tra xem token có trong danh sách blacklist không
   const isBlacklisted = await isTokenBlacklisted(token)
   if (isBlacklisted) {
      return new Error({ error: 'Access Token is blacklisted.' })
   }
   return new Promise((resolve, reject) => {
      jwt.verify(token, keySecret, (err, payload) => {
         if (err) {
            reject(err)
         } else {
            resolve(payload)
         }
      })
   })
}

const generateRefreshToken = (id) => {
   return new Promise((resolve, reject) => {
      jwt.sign({ id }, keySecret, { expiresIn: '1y' }, (err, token) => {
         if (err) {
            reject(err)
         } else {
            client.set(id.toString(), token, 'EX', 365 * 24 * 60 * 60, (err, reply) => {
               if (err) {
                  reject(err)
               } else {
                  resolve(token)
               }
            })
         }
      })
   })
}

const verifyRefreshToken = async (tokenRefresh) => {
   return new Promise((resolve, reject) => {
      jwt.verify(tokenRefresh, keySecret, (err, payload) => {
         if (err) {
            return reject(err)
         }
         client.get(payload.id.toString(), (err, reply) => {
            if (err) {
               return reject(err)
            }

            if (tokenRefresh === reply) {
               return resolve(payload)
            }
            return reject(new Error('Unauthorized'))
         })
      })
   })
}

module.exports = { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken, addToBlacklist }
