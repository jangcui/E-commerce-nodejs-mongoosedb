const asyncHandler = require('express-async-handler');
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../untils/cloudinary');
const fs = require('fs');

////upload image
const uploadImages = asyncHandler(async (req, res) => {
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newPath = await uploader(path);
            urls.push(newPath);
            fs.unlinkSync(path);
        }
        const images = urls.map((file) => {
            return file;
        });

        res.json(images);
    } catch (err) {
        throw new Error(err);
    }
});
const deleteImage = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = cloudinaryDeleteImg(id, 'images');
        res.json({ message: 'deleted' });
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = {
    uploadImages,
    deleteImage,
};
