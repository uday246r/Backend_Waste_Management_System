const express = require("express");
const pickupRequestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { companyAuth } = require("../middlewares/companyAuth")
const PickupRequest = require("../models/schedulePickup");
const Company = require("../models/company");

// ✅ Send pickup request from user to company
pickupRequestRouter.post("/:status/:toCompanyId", userAuth, async (req, res) => {
  try {
      const fromUserId = req.user._id;
      const toCompanyId = req.params.toCompanyId;
      const status = req.params.status;

      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
          return res.status(400).json({ message: "Invalid status type: " + status });
      }

      const toCompany = await Company.findById(toCompanyId);
      if (!toCompany) {
          return res.status(404).json({ message: "Company not found" });
      }

      const existingRequest = await PickupRequest.findOne({ fromUserId, toCompanyId });
      if (existingRequest) {
          return res.status(409).json({
              message: "Request already sent",
              status: existingRequest.status,
          });
      }

      const newRequest = new PickupRequest({ fromUserId, toCompanyId, status });
      const data = await newRequest.save();

      res.json({ message: "Pickup request " + status, data });
  } catch (err) {
      res.status(400).send("ERROR: " + err.message);
  }
});

// ✅ Accept pickup request (company side)
pickupRequestRouter.post("/accept/:requestId", companyAuth, async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const loggedInCompany = req.user;

        const pickupRequest = await PickupRequest.findOne({
            _id: requestId,
            toCompanyId: loggedInCompany._id,
            status: "interested",
        });

        if (!pickupRequest) {
            return res.status(404).json({ message: "Pickup request not found" });
        }

        pickupRequest.status = "accepted";
        await pickupRequest.save();

        res.json({ message: "Request accepted", data: pickupRequest });
    } catch (err) {
        res.status(400).send("ERROR: " + err.message);
    }
});

module.exports = pickupRequestRouter;
