const User = require('../models/userModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');

const { faker } = require('@faker-js/faker');
const uniqid = require('uniqid');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { generateToken } = require('../config/jwtToken');
const validateMongooseDbId = require('../untils/validateMongooseDbId');
const { generateRefreshToken } = require('../config/refreshToken');
const crypto = require('crypto');
const { sendEmail } = require('./emailCtrl');

///create user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email });
    if (!findUser) {
        //create new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        //handle user
        throw new Error('User already exists');
    }
});

//create random user
const createRandomUser = asyncHandler(async (req, res) => {
    //create new user
    for (let i = 0; i <= 10; i++) {
        const newUser = await User.create({
            email: faker.internet.email(),
            fist_name: faker.name.firstName(),
            last_name: faker.name.lastName(),
            mobile: faker.phone.phoneNumber('+84-##-###-####'),
            password: faker.internet.password(),
            address: faker.address.streetAddress(),
        });
        res.json(newUser);
    }
});

///login user
const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //if user exists or not
    const findUser = await User.findOne({ email });
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findUser._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findUser?._id,
            fist_name: findUser?.fist_name,
            last_name: findUser?.last_name,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

///login admin
const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //if user exists or not
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') {
        throw new Error(' not authorized');
    }
    if (findAdmin && (await findAdmin.isPasswordMatched(password))) {
        const refreshToken = await generateRefreshToken(findAdmin._id);
        const updateUser = await User.findByIdAndUpdate(
            findAdmin.id,
            {
                refreshToken: refreshToken,
            },
            {
                new: true,
            },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,
        });
        res.json({
            _id: findAdmin?._id,
            fist_name: findAdmin?.fist_name,
            last_name: findAdmin?.last_name,
            email: findAdmin?.email,
            role: findAdmin?.role,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});

///get all user
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    } catch (error) {
        throw new Error(error);
    }
});

//get a user
const getAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const getUser = await User.findById(id);
        res.json(getUser);
    } catch (error) {
        throw new Error(error);
    }
});

// save address user
const saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const updatedAUser = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            },
        );
        res.json(updatedAUser);
    } catch (error) {
        throw new Error(error);
    }
});

//delete a user
const deleteAUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const deleteAUser = await User.findByIdAndDelete(id);
        res.json(deleteAUser);
    } catch (error) {
        throw new Error(error);
    }
});

///handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
        throw new Error('no refresh token in cookie');
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        throw new Error('no refresh token present in db or not matched.');
    }
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error('there is something wrong with the refresh token');
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken });
    });
    res.json(user);
});

//// handle logout
const logOut = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    if (!cookie?.refreshToken) {
        throw new Error('no refresh token in cookie');
    }
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken });
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.status(204); ///forbidden
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: '',
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204); ///forbidden
});

//update a user
const updatedAUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const updatedAUser = await User.findByIdAndUpdate(
            _id,
            {
                fist_name: req?.body?.fist_name,
                last_name: req?.body?.last_name,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            },
        );
        res.json(updatedAUser);
    } catch (error) {
        throw new Error(error);
    }
});

//block and unblock user
//block
const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: true,
            },
            {
                new: true,
            },
        );
        res.json({
            message: 'user blocked',
        });
    } catch (error) {
        throw new Error(error);
    }
});

//unblock
const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validateMongooseDbId(id);
    try {
        const block = await User.findByIdAndUpdate(
            id,
            {
                isBlocked: false,
            },
            {
                new: true,
            },
        );
        res.json({
            message: 'user unblocked',
        });
    } catch (error) {
        throw new Error(error);
    }
});

/// update password
const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { password } = req.body;
    validateMongooseDbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        const updatePassword = await user.save();
        res.json(updatePassword);
    } else {
        res.json(user);
    }
});

/// forgot password token
const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('user not found');
    }
    try {
        const token = await user.createPasswordResetToken();
        user.save();
        const resetURL = `hi, please follow this link to reset your password, this link is valid till 10 minutes from now.
         <a href='http://localhost:5000/api/user/reset-password/${token}'>Click hear!</a>`;
        const data = {
            to: email,
            text: 'hey user',
            subject: 'forgot password link',
            htm: resetURL,
        };
        res.json(`Token: ${token}`);
        sendEmail(data);
    } catch (err) {
        throw new Error(err);
    }
});

///reset password
const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        // passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
        throw new Error('invalid token expired, try again later');
    }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});

//get wishlist
const getWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser);
    } catch (err) {
        throw new Error(err);
    }
});

// add to cart user
const userCart = asyncHandler(async (req, res) => {
    const { cart } = req.body;
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        let products = [];
        const user = await User.findById(_id);
        // check if user already product in cart
        let alreadyExistCart = await Cart.findOne({ orderBy: user._id });
        if (alreadyExistCart) {
            await Cart.findByIdAndDelete(alreadyExistCart._id);
        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            if (!getPrice || !getPrice.price) {
                throw new Error(`Price not found for product with ID ${cart[i]._id}`);
            }
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal += products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderBy: user._id,
        }).save();
        res.json(newCart);
    } catch (err) {
        throw new Error(err);
    }
});

// get user cart
const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const findCart = await Cart.findOne({ orderBy: _id }).populate('products.product');
        res.json(findCart);
    } catch (err) {
        throw new Error(err);
    }
});

//empty cart
const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const user = await User.findOne(_id);
        const cart = await Cart.findOneAndRemove({ orderBy: user._id });
        res.json(cart);
    } catch (err) {
        throw new Error(err);
    }
});

///apply coupon
const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user;
    validateMongooseDbId(_id);
    const validCoupon = await Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new Error('invalid coupon');
    }
    const user = await User.findOne(_id);
    let { cartTotal } = await Cart.findOne({ orderBy: user._id }).populate('products.product');
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
    console.log(validCoupon);
    await Cart.findOneAndUpdate(
        { orderBy: user._id },
        {
            totalAfterDiscount: totalAfterDiscount,
        },
        { new: true },
    );
    res.json(totalAfterDiscount);
});

///create order
const createOrder = asyncHandler(async (req, res) => {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        if (!COD) throw new Error('create cash order fail');
        const user = await User.findOne(_id);
        let userCart = await Cart.findOne({ orderBy: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        } else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: 'COD',
                amount: finalAmount,
                status: 'Cash on Delivery',
                createdAt: Date.now(),
                currency: 'usd',
            },
            orderBy: user._id,
            orderStatus: 'Cash on Delivery',
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                },
            };
        });
        const updated = await Product.bulkWrite(update, {});
        res.json({ message: 'success' });
    } catch (err) {
        throw new Error(err);
    }
});

//get order
const getOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const userOrder = await Order.findOne({ orderBy: _id }).populate('products.product').exec();
        res.json(userOrder);
    } catch (err) {
        throw new Error(err);
    }
});

// update order status
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    validateMongooseDbId(id);
    try {
        const findOrder = await Order.findByIdAndUpdate(
            id,
            {
                orderStatus: status,
                paymentIntent: {
                    status: status,
                },
            },
            { new: true },
        );
        res.json(findOrder);
    } catch (err) {
        throw new Error(err);
    }
});
module.exports = {
    createUser,
    loginUserCtrl,
    loginAdmin,
    handleRefreshToken,
    getAllUser,
    getAUser,
    deleteAUser,
    updatedAUser,
    blockUser,
    unBlockUser,
    logOut,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    emptyCart,
    applyCoupon,
    createOrder,
    getOrder,
    updateOrderStatus,
    createRandomUser,
};
