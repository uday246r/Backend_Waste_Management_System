const mongoose = require('mongoose');

const connectDB = async() => {
 await mongoose.connect(
    "mongodb+srv://istechitkara23:FfztmgjhXojO4hgV@wmss.mjn5hyq.mongodb.net/WMSS"
 );
};

module.exports = connectDB;
