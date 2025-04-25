const express = require('express');
const companyProfileRouter = express.Router();
const { companyAuth } = require("../middlewares/companyAuth");
const { validateEditProfileDataCompany } = require("../utils/validateCompany");

companyProfileRouter.get("/view", companyAuth, async(req,res) => {
    try{
        const company = req.company;
       
        res.send(company);
    } catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
    });

    companyProfileRouter.patch("/edit", companyAuth, async (req,res) => {
       try{
        if(!validateEditProfileDataCompany(req)){
            throw new Error("Invalid Edit Request");
        }

        const loggedInCompany = req.company;
        
        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
        
        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName}, your profile updated successfuly`,
            data: loggedInUser,
       });

       } catch (err) {
        res.status(400).send("ERROR : " + err.message);
       }
    });

    module.exports = profileRouter;
    