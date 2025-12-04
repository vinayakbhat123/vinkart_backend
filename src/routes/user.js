const express = require("express");
const { isAdmin, UserAuth } = require("../middleware/userauth");
const { User } = require("../models/user");

const userRouter = express.Router();

userRouter.get("/allusers", UserAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(400).json({
        success: false,
        message: "No User Found",
      });
    }
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/getuserdata/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById({ userId }).select(
      "-password -otp -otpExpiry"
    );
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No User Found...",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/profile/view", UserAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not Found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User found",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "User Not Found",
    });
  }
});

module.exports = { userRouter };
