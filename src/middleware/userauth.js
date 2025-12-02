const jwt = require("jsonwebtoken");
const User = require("../models/user");

const UserAuth = async (req,res,next) => {
  try {
    const {accessToken} = req.cookies();
    if(!accessToken){
      return res.status(400).json({
        success:false,
        message:"Token Expired plese Login"
      });
    // verify the token  

    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    })
    
  }

}