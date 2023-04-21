const bodyParser = require('body-parser');
const express = require('express');
const PORT = process.env.PORT || 4000;
const morgan = require('morgan');
const dbConnect = require('./src/config/dbConnect');
const { errorHandler, notFound } = require('./src/middlewares/errorHandle');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRouter = require('./src/routes/authRoute');
const productRouter = require('./src/routes/productRoute');
const blogRouter = require('./src/routes/blogRoute');
const prodCategoryRouter = require('./src/routes/prodCategoryRoute');
const blogCatRouter = require('./src/routes/blogCatRoute');
const brandRouter = require('./src/routes/brandRoute');
const enqRouter = require('./src/routes/enqRoute');
const colorRouter = require('./src/routes/colorRoute');
const couponRouter = require('./src/routes/couponRoute');

dbConnect();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 const corsOptions ={
       origin:'*', 
       credentials:true, //access-control-allow-credentials:true
        optionSuccessStatus:200,
 }
app.use(cors(corsOptions));

app.use(cookieParser());
app.use(morgan('dev'));

app.use('/api/user', authRouter);
app.use('/api/product', productRouter);
app.use('/api/blog', blogRouter);
app.use('/api/prod-category', prodCategoryRouter);
app.use('/api/blog-category', blogCatRouter);
app.use('/api/brand', brandRouter);
app.use('/api/enquiry', enqRouter);
app.use('/api/color', colorRouter);
app.use('/api/coupon', couponRouter);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server running at port: ${PORT}`);
});
