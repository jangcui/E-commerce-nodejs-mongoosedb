'use strict'

const { promisify } = require('util')
const client = require('../config/redisConnection')

function createRedisService() {
   const hGetallAsync = promisify(client.hgetall).bind(client)
   const hExistsAsync = promisify(client.hexists).bind(client)
   const hDelAsync = promisify(client.hdel).bind(client)
   const hInBrByAsync = promisify(client.hincrby).bind(client)
   const hSetAsync = promisify(client.hset).bind(client)
   const hGetAsync = promisify(client.hget).bind(client)
   const delAsync = promisify(client.del).bind(client)
   const expireAsync = promisify(client.expire).bind(client)

   const hGetAll = async (key) => hGetallAsync(key)
   const hExists = async (key, field) => hExistsAsync(key, field)
   const hDel = async (key, field) => hDelAsync(key, field)
   const hInCryBy = async (key, field, increment) => hInBrByAsync(key, field, increment)
   const hSet = async (key, field, value, expirationInSeconds) => {
      const hSetResult = await hSetAsync(key, field, value)
      if (expirationInSeconds) {
         const expireResult = await expireAsync(key, expirationInSeconds)
         console.log(`Expiration time set for ${expirationInSeconds} seconds from now. Reply: ${expireResult}`)
      }
      return hSetResult
   }
   const hGet = async (key, field) => hGetAsync(key, field)
   const Del = async (key) => delAsync(key)

   const close = () => client.quit()

   return {
      hGetAll,
      hExists,
      hDel,
      close,
      hInCryBy,
      hSet,
      hGet,
      Del,
   }
}

module.exports = createRedisService()
