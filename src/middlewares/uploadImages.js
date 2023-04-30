const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const multerStorage = multer.diskStorage({
    destination: function (req, res, callback) {
        callback(null, path.join(__dirname, '../public/images'));
    },
    filename: function (req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, file.fieldname + '-' + uniqueSuffix + '.jpeg');
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

module.exports = { uploadPhoto, blogImagResize };
