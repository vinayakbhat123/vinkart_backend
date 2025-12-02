const jwt = require("jsonwebtoken");
const {User} = require("../models/user");

const UserAuth = async (req,res,next) => {
  try {
    const {accessToken} = req.cookies;
    if(!accessToken){
      return res.status(400).json({
        success:false,
        message:"Token Expired plese Login"
      });
    }
     // verify the token  
    const tokenobj = await jwt.verify(accessToken,process.env.SECRET_KEY)
    const {_id} = tokenobj
    // Find the user
    const user = await User.findById({_id})
    if(!user){
       return res.status(400).json({
        success:false,
        message:"User not found"
      });  
    }
    req.user = user;
    next()
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    })
    
  }

}
module.exports = {UserAuth}