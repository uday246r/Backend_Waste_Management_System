const mongoose = require('mongoose');
const { MONGO_URI } = require('./env');

const connectDB = async() => {
 await mongoose.connect(MONGO_URI);
};

module.exports = connectDB;
