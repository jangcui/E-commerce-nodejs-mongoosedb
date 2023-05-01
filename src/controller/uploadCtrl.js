const asyncHandler = require('express-async-handler');
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../untils/cloudinary');
const fs = require('fs');
const { productImagResize } = require('../middlewares/uploadImages');

////upload image

const uploadImages = asyncHandler(async (req, res) => {
    try {
        await productImagResize(req, res, async () => {
            const files = req.files;
            if (!files || files.length === 0) {
                throw new Error('no file loads');
            }
            const images = [];
            await Promise.all(
                files.map(async (file) => {
                    const { path } = file;
                    const uploadedImage = await cloudinaryUploadImg(path);
                    images.push(uploadedImage);
                    fs.unlinkSync(path);
                }),
            );
            res.json(images);
        });
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
