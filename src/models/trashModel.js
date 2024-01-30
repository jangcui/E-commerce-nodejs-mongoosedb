'use strict'

const mongoose = require('mongoose') // Erase if already required

// Declare the Schema of the Mongo model
var trashSchema = new mongoose.Schema(
   {
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Blog' }],
   },
   {
      toJSON: {
         virtuals: true,
      },
      toObject: {
         virtuals: true,
      },
      timestamps: true,
   },
)

//Export the model
module.exports = mongoose.model('Trash', trashSchema)
