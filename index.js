const bodyParser = require('body-parser');
const express = require('express');
const PORT = process.env.PORT || 4000;
const morgan = require('morgan');
const dbConnect = require('./src/config/dbConnect');
const { errorHandler, notFound } = require('./src/middlewares/errorHandle');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cron = require('node-cron');
const cors = require('cors');
const cookieParser = require('cookie-parser');
// const connectRedis = require('./src/config/redisConnection');
const authRouter = require('./src/routes/authRoute');
const adminRouter = require('./src/routes/adminRoute');
const productRouter = require('./src/routes/productRoute');
const blogRouter = require('./src/routes/blogRoute');
const prodCategoryRouter = require('./src/routes/prodCategoryRoute');
const blogCatRouter = require('./src/routes/blogCatRoute');
const brandRouter = require('./src/routes/brandRoute');
const enqRouter = require('./src/routes/enqRoute');
const colorRouter = require('./src/routes/colorRoute');
const couponRouter = require('./src/routes/couponRoute');
const discountRouter = require('./src/routes/discountRoute');
const trashRouter = require('./src/routes/trashRoute');
const uploadRouter = require('./src/routes/uploadRoute');
const { autoDeleteUser, autoDeleteProduct, autoDeleteBlog } = require('./src/middlewares/expiredDelete');

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const corsOptions = {
    origin: ['http://localhost:3000', 'https://xpj-commerce.vercel.app'],
    // origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/prod-category', prodCategoryRouter);
app.use('/api/blog-category', blogCatRouter);
app.use('/api/brand', brandRouter);
app.use('/api/enquiry', enqRouter);
app.use('/api/color', colorRouter);
app.use('/api/coupon', couponRouter);
app.use('/api/discount', discountRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/trash', trashRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server running at port: ${PORT}`);
});
cron.schedule('0 0 */2 * *', () => {
    autoDeleteUser();
    autoDeleteProduct();
    autoDeleteBlog();
}).start();
