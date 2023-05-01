const asyncHandler = require('express-async-handler');

const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../untils/cloudinary');
const fs = require('fs');

////upload image

const uploadImages = asyncHandler(async (req, res) => {
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const images = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const { url, asset_id, public_id } = await uploader(path);
            images.push({ url, asset_id, public_id });
            fs.unlinkSync(path);
        }
        res.json(images);
    } catch (err) {
        throw new Error(err);
    }
});

// const uploadImages = asyncHandler(async (req, res) => {
//     try {
//         const uploader = (path) => cloudinaryUploadImg(path, 'images');
//         const files = req.files;

//         const uploadedFiles = await Promise.all(files.map((file) => uploader(file.path)));
//         const images = uploadedFiles.map((file) => file.url);

//         await Promise.all(files.map((file) => fs.promises.unlink(file.path)));

//         res.json(images);
//     } catch (err) {
//         console.error(err);
//         throw new Error('Error uploading images');
//     }
// });
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
