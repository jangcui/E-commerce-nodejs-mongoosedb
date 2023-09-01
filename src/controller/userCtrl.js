const crypto = require('crypto');
const asyncHandler = require('express-async-handler');

const {
    generateToken,
    generateRefreshToken,
    verifyRefreshToken,
    addToBlacklist,
    verifyToken,
} = require('../config/jwtToken');
const validateMongooseDbId = require('../untils/validateMongooseDbId');
const User = require('../models/userModel');
const Cart = require('../models/cartModel');
const Order = require('../models/orderModel');
const { sendEmail } = require('./emailCtrl');
const client = require('../config/redisConnection');

///create user
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const mobile = req.body.mobile;
    const findUser = await User.findOne({ email });
    const findUserMobile = await User.findOne({ mobile });
    if (findUserMobile) {
        throw new Error('This Phone Number Has Been Used Before.');
    }
    if (!findUser) {
        //create new user
        const newUser = await User.create(req.body);
        res.json(newUser);
    } else {
        //handle user
        throw new Error('User already exists');
    }
});

///login user
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //if user exists or not
    const findUser = await User.findOne({ email });
    if (!findUser) {
        throw new Error('Invalid Credentials');
    }
    if (findUser && (await findUser.isPasswordMatched(password))) {
        const accessToken = await generateToken(findUser?._id);
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(
            findUser._id,
            {
                token: accessToken,
            },
            {
                new: true,
            },
        );
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 365 * 24 * 60 * 60,
        });
        res.json({
            _id: findUser?._id,
            first_name: findUser?.first_name,
            last_name: findUser?.last_name,
            // role: findUser?.role,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: accessToken,
        });
    } else {
        throw new Error('Invalid Credentials');
    }
});
//update a user
const updateAUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const newUpdate = await User.findByIdAndUpdate(
            _id,
            {
                first_name: req?.body?.first_name,
                last_name: req?.body?.last_name,
                email: req?.body?.email,
                mobile: req?.body?.mobile,
            },
            {
                new: true,
            },
        );
        res.json(newUpdate);
    } catch (error) {
        throw new Error(error);
    }
});

// save address user
const saveAddress = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const newAddress = await User.findByIdAndUpdate(
            _id,
            {
                address: req?.body?.address,
            },
            {
                new: true,
            },
        );
        res.json(newAddress);
    } catch (error) {
        throw new Error(error);
    }
});

///handle refresh token
const refreshToken = asyncHandler(async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const refreshToken = cookie?.refreshToken;
        if (!refreshToken) {
            throw new Error('no refresh token in cookie');
        }
        const { id } = await verifyRefreshToken(refreshToken);

        const user = await User.findOne({ _id: id });
        if (!user) {
            throw new Error('Can not find user');
        }
        //add to blacklist
        await addToBlacklist(user.token);

        const newToken = await generateToken(user?._id);
        await User.findByIdAndUpdate(
            id,
            {
                token: newToken,
            },
            {
                new: true,
            },
        );
        res.json({ token: newToken });
    } catch (err) {
        next(err);
    }
});

// handle logout
const logOut = asyncHandler(async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const refreshToken = cookie?.refreshToken;
        if (!refreshToken) {
            throw new Error('no refresh token in cookie');
        }
        const { id } = await verifyRefreshToken(refreshToken);

        //add to blacklist
        await addToBlacklist(refreshToken);

        client.del(id.toString(), (err, reply) => {
            if (err) throw new Error(err.message);
        });
        const { token } = await User.findOne({ _id: id });

        //add to blacklist
        await addToBlacklist(token);

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        res.json('logged Out');
    } catch (err) {
        next(err);
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
    const { email, mobile } = req.body;
    const user = await User.findOne({ email });
    const phoneNumber = await User.findOne({ mobile });
    if (!user) {
        throw new Error('User not invalid or not found.');
    }
    if (!phoneNumber) {
        throw new Error('Phone number invalid or not found.');
    }
    try {
        const token = await user.createPasswordResetToken();
        user.save();
        // const path = process.env.BACK_END_URL
        const path = 'xpj-commerce.vercel.app';
        const resetURL = `Hi, please follow this link to reset your password, this link is valid till 10 minutes from now.
         <a href='${path}/reset-password/${token}'>Click hear!</a>`;
        const data = {
            to: email,
            text: 'Hi there!!',
            subject: 'Forgot password link',
            htm: resetURL,
        };
        res.json({ token: token });
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

// add to cart
const userCart = asyncHandler(async (req, res) => {
    const { productId, color, price, quantity } = req.body;
    const { _id } = req.user;
    validateMongooseDbId(_id);
    const product = await Cart.findOne({ productId: productId, userId: _id });
    if (!product) {
        try {
            const newCart = await new Cart({
                userId: _id,
                productId,
                color,
                price,
                quantity,
            }).save();
            res.json(newCart);
        } catch (err) {
            throw new Error(err);
        }
    } else {
        throw new Error('Product already in cart');
    }
});

// get user cart
const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const findCart = await Cart.find({ userId: _id }).populate('productId').populate('color');
        res.json(findCart);
    } catch (err) {
        throw new Error(err);
    }
});

// remove product from cart

const removeProductFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cartItemId } = req.params;
    validateMongooseDbId(_id);
    try {
        const removeProductFromCart = await Cart.deleteOne({ userId: _id, _id: cartItemId });
        res.json(removeProductFromCart);
    } catch (err) {
        throw new Error(err);
    }
});

// empty cart

const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const deleteCart = await Cart.deleteMany({ userId: _id });
        res.json(deleteCart);
    } catch (err) {
        throw new Error(err);
    }
});

// update product from cart

const updateProductQuantityFromCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { cartItemId, newQuantity } = req.params;
    validateMongooseDbId(_id);
    try {
        const cartItem = await Cart.findOne({ userId: _id, _id: cartItemId });
        cartItem.quantity = newQuantity;
        cartItem.save();
        res.json(cartItem);
    } catch (err) {
        throw new Error(err);
    }
});

// create order
const createOrder = asyncHandler(async (req, res) => {
    const { shippingInfo, orderItems, paymentInfo, total_price, total_price_after_discount } = req.body;
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const order = await Order.create({
            user: _id,
            shippingInfo,
            orderItems,
            paymentInfo,
            total_price,
            total_price_after_discount,
        });
        res.json({
            order,
            success: true,
        });
    } catch (err) {
        throw new Error(err);
    }
});

// get my order
const getMyOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validateMongooseDbId(_id);
    try {
        const myOrder = await Order.find({
            user: _id,
        })
            .populate('user')
            .populate('orderItems.productId')
            .populate('orderItems.color');
        res.json(myOrder);
    } catch (err) {
        throw new Error(err);
    }
});

module.exports = {
    createUser,
    createUser,
    login,
    refreshToken,
    updateAUser,
    logOut,
    updatePassword,
    forgotPasswordToken,
    resetPassword,
    getWishlist,
    saveAddress,
    userCart,
    getUserCart,
    createOrder,
    getMyOrder,
    removeProductFromCart,
    updateProductQuantityFromCart,
    emptyCart,
};
