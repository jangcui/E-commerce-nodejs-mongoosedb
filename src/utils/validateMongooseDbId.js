'use strict'

const mongoose = require('mongoose')
const { ForbiddenError } = require('../core/errorResponse')

const validateMongooseDbId = (id) => {
   const isValid = mongoose.Types.ObjectId.isValid(id)
   if (!isValid) {
      throw new ForbiddenError('This id is not valid or not found')
   }
}

module.exports = validateMongooseDbId
