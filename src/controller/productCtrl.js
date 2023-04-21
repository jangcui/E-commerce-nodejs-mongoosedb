const Product = require('../models/productModel');
const User = require('../models/userModel');
const { faker } = require('@faker-js/faker');
const asyncHandler = require('express-async-handler');
const fs = require('fs');
const slugify = require('slugify');
const validateMongooseDbId = require('../untils/validateMongooseDbId');
const { cloudinaryUploadImg, cloudinaryDeleteImg } = require('../untils/cloudinary');

//// create a new product
const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct);
    } catch (err) {
        throw new Error(err);
    }
});
// create random products
// const createRandomProduct = asyncHandler(async (req, res) => {
//     try {
//         const newProduct = await Product.create({
//             title: `Sản phẩm điện thoại với màn hình ${faker.random.arrayElement([
//                 'AMOLED',
//                 'IPS',
//                 'TFT',
//             ])} kích thước ${faker.random.arrayElement([
//                 '5 inch',
//                 '5.5 inch',
//                 '6 inch',
//                 '6.5 inch',
//             ])}, hỗ trợ kết nối 4G, 5G, wifi và bluetooth, bộ vi xử lý ${faker.random.arrayElement([
//                 'Snapdragon',
//                 'Exynos',
//                 'Apple A-series',
//             ])}, bộ nhớ trong ${faker.random.number({ min: 32, max: 512 })} GB và RAM ${faker.random.number({
//                 min: 2,
//                 max: 16,
//             })} GB, camera ${faker.random.number({ min: 12, max: 108 })} MP, hệ điều hành ${faker.random.arrayElement([
//                 'Android',
//                 'iOS',
//             ])}, pin dung lượng ${faker.random.number({
//                 min: 3000,
//                 max: 6000,
//             })} mAh, giá cả phù hợp với nhu cầu sử dụng của người dùng.`,
//             slug: slugify(faker.commerce.productName(), { lower: true, remove: /[*+~.()'"!:@]/g }),
//             description: `Một chiếc điện thoại ${faker.random.arrayElement([
//                 'Apple',
//                 'Samsung',
//                 'Xiaomi',
//                 'OPPO',
//                 'Vivo',
//             ])} ${faker.commerce.productName()} với màn hình ${faker.random.arrayElement([
//                 'AMOLED',
//                 'IPS',
//                 'TFT',
//             ])} đẹp mắt, đầy đủ tính năng hiện đại, giá cả hợp lý và phù hợp với nhu cầu sử dụng của bạn.`,
//             price: faker.commerce.price(100, 5000),
//             category: faker.lorem.technics(),
//             brand: faker.random.arrayElement(['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo']),
//             color: faker.random.arrayElement(['Black', 'Brown', 'Red', 'Green', 'Yellow', 'White']),
//             quantity: faker.datatype.number({ min: 10, max: 100 }),
//             images: faker.image.technics(),
//         });
//         res.json(newProduct);
//     } catch (err) {
//         throw new Error(err);
//     }
// });

/// update a product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title);
        }
        const updateProduct = await Product.findOneAndUpdate(id, req.body, {
            new: true,
        });
        res.json(updateProduct);
    } catch (err) {
        throw new Error(err);
    }
});

//// get a product
const getAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const findProduct = await Product.findById(id);
        if (!findProduct) {
            throw new Error('present product not found');
        }
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});

//get all products
const getAllProducts = asyncHandler(async (req, res) => {
    try {
        ///filtering
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach((el) => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // find product greater than or equal to, greater than, less than, and less than or equal to

        let query = Product.find(JSON.parse(queryStr));

        //sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createAt');
        }

        ///limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v');
        }

        //pagination
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        if (req.query.page) {
            const productCounts = await Product.countDocuments();

            if (skip >= productCounts) {
                throw new Error('this page dose not exists');
            }
        }

        const product = await query;
        res.json(product);
    } catch (err) {
        throw new Error(err);
    }
});

///delete a product
const deleteAProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const findProduct = await Product.findByIdAndDelete(id);
        res.json(findProduct);
    } catch (err) {
        throw new Error(err);
    }
});
///add to wishlist
const addToWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { prodId } = req.body;
    validateMongooseDbId(_id);

    try {
        const user = await User.findById(_id);
        const alreadyAdded = user?.wishlist?.find((id) => id.toString() === prodId);
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $pull: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(user);
        } else {
            let user = await User.findByIdAndUpdate(
                _id,
                {
                    $push: { wishlist: prodId },
                },
                { new: true },
            );
            res.json(user);
        }
    } catch (err) {
        throw new Error(err);
    }
});

///handler ratings
const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, comment, prodId } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.ratings?.find((userId) => userId.postedBy.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                {
                    ratings: { $elemMatch: alreadyRated },
                },
                {
                    $set: { 'ratings.$.star': star, 'ratings.$.comment': comment },
                },
                { new: true },
            );
        } else {
            const rateProduct = await Product.findByIdAndUpdate(
                prodId,
                {
                    $push: {
                        ratings: { star, comment, postedBy: _id },
                    },
                },
                { new: true },
            );
        }
        const getAllRatings = await Product.findById(prodId);
        let totalRating = getAllRatings?.ratings?.length;
        let ratingSum = getAllRatings.ratings?.map((item) => item.star)?.reduce((prev, crr) => prev + crr, 0);
        let actualRating = Math.round(ratingSum / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(
            prodId,
            {
                totalRating: actualRating,
            },
            { new: true },
        );
        res.json(finalProduct);
    } catch (err) {
        throw new Error(err);
    }
});

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
    createProduct,
    getAProduct,
    deleteAProduct,
    getAllProducts,
    updateProduct,
    addToWishList,
    rating,
    // createRandomProduct,
    uploadImages,
    deleteImage,
};
