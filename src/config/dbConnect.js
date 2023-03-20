const { default: mongoose } = require('mongoose');

const dbConnect = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URL);
        console.log('database connected successfully');
    } catch (err) {
        console.log('database connection error');
    }
};
module.exports = dbConnect;
