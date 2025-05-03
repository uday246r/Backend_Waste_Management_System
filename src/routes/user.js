// routes/user.js
const express = require('express');
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require('../models/connectionRequest');
const User = require('../models/user');
const Company = require('../models/company');
const PickupRequest = require('../models/schedulePickup');

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills";

// Get received connection requests
userRouter.get("/requests/received", userAuth, async(req, res) => {
    try {
        const loggedInUser = req.user;
        const connectionRequests = await ConnectionRequest.find({
            toUserId: loggedInUser._id,
            status: "interested",
        }).populate("fromUserId", USER_SAFE_DATA);

        res.json({
            message: "Data fetched successfully",
            data: connectionRequests,
        });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

// Get accepted connections
userRouter.get("/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted"},
            ],
        })
        .populate("fromUserId", USER_SAFE_DATA)
        .populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map((row) => {
            if(row.fromUserId._id.toString() === loggedInUser._id.toString()) {
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ data });
    } catch (err) {
        res.status(400).send({ message: err.message });
    }
});

// ✅ UPDATED: Show companies on user feed
// routes/user.js
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        limit = limit > 50 ? 50 : limit;
        const skip = (page - 1) * limit;

        // Find all pickup requests made by this user
        const pickupRequests = await PickupRequest.find({
            fromUserId: loggedInUser._id
        }).select("toCompanyId");

        const hideCompanyIds = new Set(pickupRequests.map(req => req.toCompanyId.toString()));
        // console.log("Hide Company IDs:", Array.from(hideCompanyIds));

        // Get companies that the user hasn't requested pickups from
        const companies = await Company.find({
            _id: { $nin: Array.from(hideCompanyIds) }
        })
        .select("companyName photoUrl wasteType about price")
        .skip(skip)
        .limit(limit);

        // console.log("Fetched Companies:", companies);

        res.json({ data: companies });
    } catch (err) {
        console.error("Error fetching feed data:", err);
        res.status(400).json({ message: err.message });
    }
});



module.exports = userRouter;
