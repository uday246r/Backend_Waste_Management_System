const validatorC = require("validator");

const validateSignUpDataCompany = (req) => {
    const { companyName, emailId, password, wasteType, photoUrl, about, price } = req.body;
    if(!companyName) {
        throw new Error("Name is not valid!");
    }
    else if(!emailId || !validatorC.isEmail(emailId)){
        throw new Error("Email is not valid");
    }
    else if(!validatorC.isStrongPassword(password)){
        throw new Error("Please enter a strong Password!");
    }
};

const validateEditProfileDataCompany = (req) => {
    const allowedEditFields = [
         "companyName",
         "photoUrl", 
         "wasteType",
         "about", 
         "price",

    ];

   const isEditAllowed = Object.keys(req.body).every((field) => 
        allowedEditFields.includes(field)
);

return isEditAllowed;

};

module.exports = {
    validateSignUpDataCompany,
    validateEditProfileDataCompany,
}