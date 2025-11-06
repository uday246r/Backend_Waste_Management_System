const express = require('express');
const companyRouter = express.Router();
const { companyAuth } = require("../middlewares/companyAuth");
const PickupRequest = require('../models/schedulePickup');
const Video = require('../models/Video');

// const { companyFeedController } = require('../controllers/companyController');

companyRouter.get('/feed', companyAuth, async(req,res)=>{
    try{
        const totalPickupRequests = (await PickupRequest.find()).length;
        const pendingPickupRequests = (await PickupRequest.find({ status: 'pending' })).length;
        const acceptedPickupRequests = (await PickupRequest.find({ status: 'accepted' })).length;
        const rejectedPickupRequests = (await PickupRequest.find({ status: 'rejected' })).length;
        const pickedUpPickupRequests = (await PickupRequest.find({ status: 'picked-up' })).length;
        const diyVideos = (await Video.find({ userId: req.company._id })).length;
        res.status(200).json({totalPickupRequests,pendingPickupRequests,acceptedPickupRequests,rejectedPickupRequests,pickedUpPickupRequests,diyVideos});
    }
    catch(err){
        res.status(500).json({ message: 'Server Error', error: err.message });
    }
}); 

module.exports = companyRouter;


// try {
//         const loggedInUser = req.user;

//         const page = parseInt(req.query.page) || 1;
//         let limit = parseInt(req.query.limit) || 10;
//         limit = limit > 50 ? 50 : limit;
//         const skip = (page - 1) * limit;

//         // Find all pickup requests made by this user
//         const pickupRequests = await PickupRequest.find({
//             fromUserId: loggedInUser._id
//         }).select("toCompanyId");

//         const hideCompanyIds = new Set(pickupRequests.map(req => req.toCompanyId.toString()));
//         // console.log("Hide Company IDs:", Array.from(hideCompanyIds));

//         // Get companies that the user hasn't requested pickups from
//         const companies = await Company.find({
//             _id: { $nin: Array.from(hideCompanyIds) }
//         })
//         .select("companyName photoUrl wasteType pickupTimeFrom pickupTimeTo location about price")
//         .skip(skip)
//         .limit(limit);

//         // console.log("Fetched Companies:", companies);

//         res.json({ data: companies });
//     } catch (err) {
//         console.error("Error fetching feed data:", err);
//         res.status(400).json({ message: err.message });
//     }