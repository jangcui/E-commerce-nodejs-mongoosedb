const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const dbConnect = require('./src/config/dbConnect');
const { errorHandler, notFound } = require('./src/middlewares/errorHandle');
const app = express();
const dotenv = require('dotenv').config();
const cookieParser = require('cookie-parser');
const PORT = process.env.PORT || 4000;

const authRouter = require('./src/routes/authRoute');
const productRouter = require('./src/routes/productRoute');
const blogRouter = require('./src/routes/blogRoute');
const prodCategoryRouter = require('./src/routes/prodCategoryRoute');
const blogCatRouter = require('./src/routes/blogCatRoute');
const brandRouter = require('./src/routes/brandRoute');
const couponRouter = require('./src/routes/couponRoute');

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/prod-category', prodCategoryRouter);
app.use('/api/blog-category', blogCatRouter);
app.use('/api/brand', brandRouter);
app.use('/api/coupon', couponRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server running at port: ${PORT}`);
});
