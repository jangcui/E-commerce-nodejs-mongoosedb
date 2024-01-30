'use strict'

const mongoose = require('mongoose')

// Declare the Schema of the Mongo model
var discountSchema = new mongoose.Schema({
   name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
   },
   expiry: {
      type: Date,
      required: true,
   },
   percentage: {
      type: Number,
      required: true,
   },
})

//Export the model
module.exports = mongoose.model('Discount', discountSchema)
