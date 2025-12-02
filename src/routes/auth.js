const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { ValidateSignUp, ValidateLogin } = require("../utils/ValidateData");
const { User } = require("../models/user");
const { VerifyEmail } = require("../emailVerify/emailVerify");
const { Session } = require("../models/session");

authRouter.post("/auth/signup", async (req, res) => {
  try {
    // validate the data
    ValidateSignUp(req);
    const { firstName, lastName, emailId, password } = req.body;
    const userEmail = await User.findOne({ emailId });
    if (userEmail) {
      throw new Error("User Already exist");
    }
    // make password protect using bcrypt
    const passwordhash = await bcrypt.hash(password, 10);
    // created user instance from User Model and add all the fields
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordhash,
    });
    // creating token for email
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    VerifyEmail(token, emailId);
    user.token = token;
    // saved the fields in database
    const saveduser = await user.save();
    res.json({ message: "User Data saved ", data: saveduser });
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});
authRouter.post("/auth/verify", async (req, res) => {
  try {
    const Tokens = req.headers.authorization;

    // Validate the token header
    if (!Tokens || !Tokens.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Authorization token is missing or invalid",
      });
    }

    const token = Tokens.split(" ")[1];
    let decoded;

    // Token verification block
    try {
      decoded = jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(400).json({
          success: false,
          message: "Registration token expired",
        });
      }
      return res.status(400).json({
        success: false,
        message: "Token verification failed",
      });
    }

    // Fetch user profile based on the decoded payload
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    user.token = null;
    user.isVerified = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
authRouter.post("/auth/reverify", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!validator.isEmail(emailId)) {
      throw new Error("Email is not valid!");
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User Not Found",
      });
    }
    const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
      expiresIn: "10m",
    });
    VerifyEmail(token, emailId);
    user.token = token;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Email sent again successfully",
      token: user.token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
authRouter.post("/auth/login", async (req, res) => {
  try {
    // validate emailId and password
    ValidateLogin(req);
    const {emailId,password} = req.body
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    const ispasswordvalid = await user.validatePassword(password);
    if (!ispasswordvalid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }
    if (user.isVerified === false) {
      return res.status(400).json({
        success: false,
        message: "Please Verify your account then login",
      });
    }
    // Token creation and send to cookie
    const accessToken = await user.accessJWT();
    res.cookie("accessToken", accessToken, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    
    const refreshToken = await user.refreshJWT();
    res.cookie("refreshToken", refreshToken, {
      expires: new Date(Date.now() + 8 * 3600000),
    });


    user.isLoggedIn = true,
    await user.save();
    
    //Check for existing session and delete it
    const oldSession = await Session.findOne({userId:user._id});
    if (oldSession) {
      await Session.deleteOne({userId:user._id})      
    }

    // create a new session
    await Session.create({userId:user._id});
    return res.status(200).json({
      success:true,
      message:  `Welcome back ${user.firstName}`,
      user
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = { authRouter };
