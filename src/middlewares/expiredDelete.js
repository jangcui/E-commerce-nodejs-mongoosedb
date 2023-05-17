const cron = require('node-cron');
const Product = require('../models/productModel');
const Blog = require('../models/blogModel');
const User = require('../models/userModel');

cron.schedule('0 0 */2 * *', async () => {
    try {
        const currentDate = new Date();

        const result = await Product.deleteMany({
            isDelete: true,
            deleteDate: { $lt: currentDate },
        });

        console.log(`Deleted`);
    } catch (error) {
        console.error('error:', error);
    }
}).start();

cron.schedule('0 0 */2 * *', async () => {
    try {
        const currentDate = new Date();

        const result = await Blog.deleteMany({
            isDelete: true,
            deleteDate: { $lt: currentDate },
        });

        console.log(`Deleted`);
    } catch (error) {
        console.error('error:', error);
    }
}).start();
cron.schedule('0 0 */2 * *', async () => {
    try {
        const currentDate = new Date();

        const result = await User.deleteMany({
            isDelete: true,
            deleteDate: { $lt: currentDate },
        });
        console.log(`Deleted`);
    } catch (error) {
        console.error('error:', error);
    }
}).start();
