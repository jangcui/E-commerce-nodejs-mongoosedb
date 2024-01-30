'use strict'

const multer = require('multer')
const sharp = require('sharp')
const path = require('path')
const fs = require('fs')

const multerStorage = multer.diskStorage({
   filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
   },
})
const multerFilter = (req, file, callback) => {
   if (file.mimetype.startsWith('image')) {
      callback(null, true)
   } else {
      callback(new Error('unsupported file format'), false)
   }
}

const uploadPhoto = multer({
   storage: multerStorage,
   fileFilter: multerFilter,
   limits: { fileSize: 2000000 },
})

const reSizeImage = async (req, res, next) => {
   try {
      if (!req.files) {
         return next()
      }
      await Promise.all(
         req.files.map(async (file) => {
            await sharp(file.path)
               .resize({
                  width: 1000,
                  height: 1000,
                  fit: sharp.fit.inside,
                  withoutEnlargement: true,
               })
               .jpeg({
                  quality: 90,
                  progressive: true,
               })
               .toFormat('jpeg')
         }),
      )
      next()
   } catch (err) {
      next(err)
   }
}

module.exports = { uploadPhoto, reSizeImage }
