const express = require("express");
const authRouter = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const {
  ValidateSignUp,
  ValidateLogin,
  ValidateChangePassword,
} = require("../utils/ValidateData");
const { User } = require("../models/user");
const { UserAuth } = require("../middleware/userauth");
const { SendOTP } = require("../emailVerify/SendOTP");

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
    // save data in database
    const userData = await user.save();
    // creating token for email
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    console.log("token created in signup", token);

    return res.status(200).json({
      success: true,
      message: "User Data saved ",
      userData,
    });
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});
authRouter.post("/auth/login", async (req, res) => {
  try {
    // validate emailId and password
    ValidateLogin(req);
    const { emailId, password } = req.body;
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (user.isLoggedIn === true) {
      return res.status(400).json({
        success: false,
        message: "You are already login",
      });
    }
    const ispasswordvalid = await user.validatePassword(password);
    if (!ispasswordvalid) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Token creation and send to cookie
    const token = await user.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 8 * 3600000),
    });
    console.log("token created after login",token)
    user.isLoggedIn = true;
    const saveduser = await user.save();

    return res.status(200).json({
      success: true,
      message: `Welcome back ${user.firstName}`,
      saveduser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

authRouter.post("/auth/logout", UserAuth, async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    const user = req.user;
    user.isLoggedIn = false;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Logout Successfull",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error occured while logout...",
    });
  }
});

authRouter.post("/auth/forgetpassword", async (req, res) => {
  try {
    const { emailId } = req.body;
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid",
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 90000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = null;
    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();
    await SendOTP(otp, emailId);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully ",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

authRouter.post("/auth/verifyotp/:emailId", async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not valid",
      });
    }
    const { emailId } = req.params;
    if (!validator.isEmail(emailId)) {
      return res.status(400).json({
        success: false,
        message: "Email not valid",
      });
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP is not generated or already login",
      });
    }
    if (user.otpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired please request new one",
      });
    }
    if (otp !== user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }
    user.otp = null;
    user.otpExpiry = null;
    await user.save();
    return res.status(400).json({
      success: false,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

authRouter.post("/auth/changepassword/:emailId", async (req, res) => {
  try {
    const { newpassword, confirmpassword } = req.body;
    const { emailId } = req.params;
    // validate the email and password
    ValidateChangePassword(newpassword, confirmpassword, emailId);
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user not found",
      });
    }
    if (!newpassword === confirmpassword) {
      throw new Error("Both password must be same");
    }
    user.password = null;
    const passwordhash = await bcrypt.hash(newpassword, 10);
    user.password = passwordhash;
    await user.save();
    return res.status(200).json({
      success: true,
      message: "Password changed succesfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = { authRouter };
