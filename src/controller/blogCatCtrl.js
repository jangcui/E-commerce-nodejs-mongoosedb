'use strict'

const BlogCategory = require('../models/blogCatModel')
const asyncHandler = require('express-async-handler')
const validateMongooseDbId = require('../utils/validateMongooseDbId')

///cerate category
const createCategory = asyncHandler(async (req, res) => {
   try {
      const newCategory = await BlogCategory.create(req.body)
      res.json(newCategory)
   } catch (err) {
      throw new Error(err)
   }
})

///update category
const updateCategory = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const updateCategory = await BlogCategory.findByIdAndUpdate(id, req.body, { new: true })
      res.json(updateCategory)
   } catch (err) {
      throw new Error(err)
   }
})
///get the category
const getTheCategory = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const getTheCategory = await BlogCategory.findById(id)
      res.json(getTheCategory)
   } catch (err) {
      throw new Error(err)
   }
})

///get all category
const getAllCategory = asyncHandler(async (req, res) => {
   try {
      const getAllCategory = await BlogCategory.find()
      res.json(getAllCategory)
   } catch (err) {
      throw new Error(err)
   }
})

///delete category
const deleteTheCategory = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const deleteTheCategory = await BlogCategory.findByIdAndDelete(id)
      res.json({ message: 'Deleted.' })
   } catch (err) {
      throw new Error(err)
   }
})
module.exports = { createCategory, updateCategory, getTheCategory, getAllCategory, deleteTheCategory }
