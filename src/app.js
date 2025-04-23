const express = require('express');
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Middlewares
app.use(
   cors({
      origin: "http://localhost:5174", // frontend URL
      credentials: true,
   })
);
app.use(express.json());
app.use(cookieParser());

// Import Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const videoRouter = require("./routes/videoRoutes"); // ✅ NEW

// Use Routes
app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/videos", videoRouter); // ✅ NEW

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
