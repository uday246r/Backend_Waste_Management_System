
const mongoose = require('mongoose');

const schedulePickupRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true
    },
    toCompanyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company", 
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        }
    }
},
 {  timestamps: true }
);

// To make queries fast we use concept of index and when write two index simultaneously called compound index as below - internal functioning done by mongoDB - beneficitial if we have billions of record in our database
schedulePickupRequestSchema.index({ fromUserId : 1 , toCompanyId: 1});

schedulePickupRequestSchema.pre("save", function (next) {  // don't use arrow function here, arrow function get break when we use "this" with them
    const request = this;
    // Check if the fromUserId is same as to toUserId
    if(request.fromUserId.equals(request.toUserId)){
        throw new Error("Cannot send connection request to yourself!");
    }
    next();
});

const PickupRequestModel = new mongoose.model(
    "PickupRequest",
    schedulePickupRequestSchema
);

module.exports = PickupRequestModel;