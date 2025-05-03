const express = require("express");
const authCRouter = express.Router();
const { validateSignUpDataCompany } = require("../utils/validateCompany");
const Company = require("../models/company");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

 authCRouter.post("/signup", async (req, res) => {
     try{
        // validation of data
     validateSignUpDataCompany(req);
     //Encrypt the password
 
     const { companyName, emailId, password, wasteType, photoUrl, location, about, price} = req.body;
     const passwordHash = await bcrypt.hash(password, 10);
    //  console.log(passwordHash);
 // Creating a new instance of the User model
     const company = new Company({
         companyName,
         emailId,
         password: passwordHash,
         wasteType,
         photoUrl,
         location,
         about,
         price
     });
 
     const savedCompany = await company.save();
     const token = await savedCompany.getJWT();

     res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
     });
     
     res.json({ message: "Company added sucessfully", data: savedCompany });
     } catch(err) {
         res.status(400).send("ERROR :  " + err.message);
     }
 });

 authCRouter.post("/login", async(req,res) => {
    try{
        const { emailId, password } = req.body;

        const company = await Company.findOne({ emailId: emailId });
        if(!company) {
            throw new Error("Invalid credentials");
        }
        const isPasswordValid = await company.validatePassword(password);

        if(isPasswordValid){

            // create a JWT Token

            const token = await company.getJWT();
            // console.log(token);

            //Add the token to cookie and send the response back to the user
            res.cookie("token",token, {
                expires: new Date(Date.now() + 8 * 36000000),
            });
            res.send(company);
        } else{
            throw new Error("Invalid credentials");
        }

    } catch (err){
        res.status(400).send("Error : " + err.message);
    }
})

authCRouter.post("/logout", async (req,res) => {
    res.cookie("token",null,{
        expires: new Date(Date.now()),
    });
    res.send("Logout Successful!!");
});


 module.exports = authCRouter;