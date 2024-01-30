'use strict'

const cron = require('node-cron')
const Product = require('../models/productModel')
const Blog = require('../models/blogModel')
const User = require('../models/userModel')

const autoDeleteProduct = async () => {
   try {
      const currentDate = new Date()

      const result = await Product.deleteMany({
         isDelete: true,
         deleteDate: { $lt: currentDate },
      })

      console.log(`Product Deleted`)
   } catch (error) {
      console.error('error:', error)
   }
}

const autoDeleteBlog = async () => {
   try {
      const currentDate = new Date()

      const result = await Blog.deleteMany({
         isDelete: true,
         deleteDate: { $lt: currentDate },
      })

      console.log(`Blog Deleted`)
   } catch (error) {
      console.error('error:', error)
   }
}
const autoDeleteUser = async () => {
   try {
      const currentDate = new Date()

      const result = await User.deleteMany({
         isDelete: true,
         deleteDate: { $lt: currentDate },
      })
      console.log(`User Deleted`)
   } catch (error) {
      console.error('error:', error)
   }
}

module.exports = {
   autoDeleteUser,
   autoDeleteProduct,
   autoDeleteBlog,
}
