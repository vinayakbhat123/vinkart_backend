const express = require("express");
const { isAdmin, UserAuth } = require("../middleware/userauth");
const { User } = require("../models/user");
const { default: cloudinary } = require("../utils/cloudinary");
const { singleUpload } = require("../middleware/multer");

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
userRouter.patch("/update/:id",UserAuth,singleUpload, async (req,res) => {
  try {
    const userIdToUpdate = req.params;
    const LoggedInUser = req.user;   // from userAuth;
    const {firstName,lastName,address,city,zipcode,phoneno,role} = req.body;

    if(LoggedInUser._id.toString() !== userIdToUpdate &&
    LoggedInUser.role !== "admin"){
      return res.status(404).json({
        success:false,
        message:"You are not allowed to update this profile"
      });
    }
    let user = await User.findById(userIdToUpdate);
    if(!user){
      return res.status(400).json({
        success:false,
        message:"User not found"
      });
    }
    let photoUrl = user.photoUrl;
    let photoId = user.photoId;
    if(req.file){
      if(photoId){
        await cloudinary.uploader.destroy(photoId)
      }
    }
    const UploadResult = await new Promise((resolve,reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {folder:"profiles"},
        (error,result) => {
          if(error) reject(error)
            else resolve(result)
        }
      );
      stream.end(req.file.buffer)
    });
    photoUrl = UploadResult.secure_url;
    photoId = UploadResult.public_id

    // Update fields
    user.firstName= firstName ||  user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.city = city ||  user.city;
    user.zipcode = zipcode ||  user.zipcode;
    user.phoneno = phoneno ||  user.phoneno;
    user.photoUrl = photoUrl || user.photoUrl;
    user.photoId = photoId || user.photoId;

    const updatedUser = await user.save();
    return res.status(200).json({
      success:true,
      message:"Profile updated Successfully",
      user:updatedUser
    })
  } catch (error) {
    return res.status(400).json({
      success:false,
      message:error.message
    })
    
  }
})
module.exports = { userRouter };
