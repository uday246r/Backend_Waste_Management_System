const express = require('express');
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middlewares
app.use(
   cors({
      origin: "http://localhost:5173", // frontend URL
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());

// Import Routes
const authRouter = require("./routes/auth");
const companyAuthRouter = require("./routes/companyRoutes");
const profileRouter = require("./routes/profile");
const companyProfileRouter = require("./routes/companyProfile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
// const companyRouter = require("./routes/company");
const videoRouter = require("./routes/videoRoutes"); // ✅ NEW
const pickupRequestRouter = require("./routes/scheduleRequest")


// Use Routes
app.use("/auth/user", authRouter);
app.use("/auth/company", companyAuthRouter);
app.use("/profile", profileRouter);
app.use("/companyProfile", companyProfileRouter);
app.use("/request", requestRouter);
app.use("/user", userRouter);
// app.use("/company",companyRouter);
app.use("/videos", videoRouter); // ✅ NEW

app.use("/pickup", pickupRequestRouter);

// Connect to DB and start server
connectDB()
 .then(() => {
    console.log("Database connection established....");
    app.listen(4000, () => {
        console.log("Server successfully run on port no. 4000....");
    }); 
 })
 .catch((err) => {
    console.log("Database cannot be established");
 });
