'use strict'

const asyncHandler = require('express-async-handler')
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../utils/cloudinary')
const fs = require('fs')
const { reSizeImage } = require('../middlewares/uploadImages')

////upload image

const uploadImages = asyncHandler(async (req, res) => {
   try {
      await reSizeImage(req, res, async () => {
         const files = req.files
         if (!files || files.length === 0) {
            throw new Error('no file loads')
         }
         const images = []
         await Promise.all(
            files.map(async (file) => {
               const { path } = file
               const uploadedImage = await cloudinaryUploadImg(path)
               images.push(uploadedImage)
               fs.unlinkSync(path)
            }),
         )
         res.json(images)
      })
   } catch (err) {
      throw new Error(err)
   }
})

const deleteImage = asyncHandler(async (req, res) => {
   const { id } = req.params
   try {
      const deleted = cloudinaryDeleteImg(id, 'images')
      res.json({ message: 'Deleted.' })
   } catch (err) {
      throw new Error(err)
   }
})
const deleteManyImage = asyncHandler(async (req, res) => {
   const { ids } = req.body
   try {
      const deletePromises = ids.map((id) => cloudinaryDeleteImg(id, 'images'))
      await Promise.all(deletePromises)
      res.json({ message: 'Deleted.' })
   } catch (err) {
      throw new Error(err)
   }
})

module.exports = {
   uploadImages,
   deleteImage,
   deleteManyImage,
}
