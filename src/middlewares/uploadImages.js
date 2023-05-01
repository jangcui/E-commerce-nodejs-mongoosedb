const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});
const multerFilter = (req, file, callback) => {
    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    } else {
        callback(new Error('unsupported file format'), false);
    }
};

const uploadPhoto = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits: { fileSize: 2000000 },
});

const productImagResize = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    try {
        await Promise.all(
            req.files.map(async (file) => {
                await sharp(file.path)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`src/public/images/products/${file.filename}`);
                fs.unlinkSync(`src/public/images/products/${file.filename}`);
            }),
        );
        next();
    } catch (err) {
        next(err);
    }
};

const blogImagResize = async (req, res, next) => {
    if (!req.files) {
        return next();
    }
    try {
        await Promise.all(
            req.files.map(async (file) => {
                await sharp(file.path)
                    .resize(300, 300)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`src/public/images/blogs/${file.filename}`);
                fs.unlinkSync(`src/public/images/blogs/${file.filename}`);
            }),
        );
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { uploadPhoto, productImagResize, blogImagResize };
