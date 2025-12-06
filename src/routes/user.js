const express = require("express");
const { isAdmin, UserAuth } = require("../middleware/userauth");
const { User } = require("../models/user");
const cloudinary = require("../utils/cloudinary"); // already exports v2 instance
const { singleUpload } = require("../middleware/multer");

const userRouter = express.Router();

userRouter.get("/allusers", UserAuth, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry");
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found",
      });
    }
    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET single user by id (fixed findById call)
userRouter.get("/getuserdata/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("-password -otp -otpExpiry");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found",
      });
    }
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

userRouter.get("/profile/view", UserAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    // ensure sensitive props are not leaked
    const safeUser = { ...user.toObject() };
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiry;

    return res.status(200).json({
      success: true,
      message: "User found",
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "User not found",
    });
  }
});

userRouter.patch("/update/:userId", UserAuth, singleUpload, async (req, res) => {
  try {
    const userIdToUpdate = req.params.userId;
    const LoggedInUser = req.user; // from UserAuth middleware

    // authorization: allow self or admin
    if (
      LoggedInUser._id.toString() !== userIdToUpdate &&
      LoggedInUser.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this profile",
      });
    }

    let user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // destructure expected keys (frontend must send these exact keys)
    const { firstName, lastName, address, city, zipCode, phoneNo, role } = req.body;

    // handle optional file upload
    let photoUrl = user.photoUrl;
    let photoId = user.photoId;
    if (req.file && req.file.buffer) {
      // delete previous photo if exists
      if (photoId) {
        try {
          await cloudinary.uploader.destroy(photoId);
        } catch (err) {
          // non-fatal: log and continue
          console.warn("Cloudinary destroy failed:", err.message || err);
        }
      }

      const UploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profiles" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });

      photoUrl = UploadResult.secure_url;
      photoId = UploadResult.public_id;
    }

    // Update fields — IMPORTANT: use exact schema field names
    user.firstName = firstName !== undefined ? firstName : user.firstName;
    user.lastName = lastName !== undefined ? lastName : user.lastName;
    user.address = address !== undefined ? address : user.address;
    user.city = city !== undefined ? city : user.city;
    user.zipCode = zipCode !== undefined ? zipCode : user.zipCode; // correct name
    user.phoneNo = phoneNo !== undefined ? phoneNo : user.phoneNo; // correct name
    user.photoUrl = photoUrl !== undefined ? photoUrl : user.photoUrl;
    user.photoId = photoId !== undefined ? photoId : user.photoId;

    // role change only if admin
    if (LoggedInUser.role === "admin" && role !== undefined) {
      user.role = role;
    }

    const updatedUser = await user.save();

    // remove sensitive fields before sending back
    const safeUser = { ...updatedUser.toObject() };
    delete safeUser.password;
    delete safeUser.otp;
    delete safeUser.otpExpiry;

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error("Update error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

module.exports = { userRouter };
