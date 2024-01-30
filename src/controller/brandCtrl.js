'use strict'

const Brand = require('../models/brandModel')
const asyncHandler = require('express-async-handler')
const validateMongooseDbId = require('../utils/validateMongooseDbId')

///cerate brand
const createBrand = asyncHandler(async (req, res) => {
   try {
      const newBrand = await Brand.create(req.body)
      res.json(newBrand)
   } catch (err) {
      throw new Error(err)
   }
})

///update brand
const updateBrand = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const updateBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true })
      res.json(updateBrand)
   } catch (err) {
      throw new Error(err)
   }
})
///get the brand
const getTheBrand = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const getTheBrand = await Brand.findById(id)
      res.json(getTheBrand)
   } catch (err) {
      throw new Error(err)
   }
})

///get all brands
const getAllBrands = asyncHandler(async (req, res) => {
   try {
      const getAllBrands = await Brand.find()
      res.json(getAllBrands)
   } catch (err) {
      throw new Error(err)
   }
})

///delete brand
const deleteTheBrand = asyncHandler(async (req, res) => {
   const { id } = req.params
   validateMongooseDbId(id)
   try {
      const deleteTheBrand = await Brand.findByIdAndDelete(id)
      res.json({ message: 'Deleted.' })
   } catch (err) {
      throw new Error(err)
   }
})
module.exports = { createBrand, updateBrand, getTheBrand, getAllBrands, deleteTheBrand }
