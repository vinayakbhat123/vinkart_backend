const jwt = require("jsonwebtoken");
const {User} = require("../models/user");

const UserAuth = async (req,res,next) => {
  try {
    const {token} = req.cookies;
    if(!token){
      return res.status(400).json({
        success:false,
        message:"Something went wrong please Login"
      });
    }
     // verify the token  
    const tokenobj = await jwt.verify(token,process.env.SECRET_KEY)
    const {_id} = tokenobj
    // Find the user
    const user = await User.findById(_id)
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

const isAdmin = async (req,res,next) => {
  if(req.user && req.user.role === "admin"){
    next()
  } else {
    return res.status(400).json({
      succes:false,
      message:"Access denied: admins only"
    })
  }
}
module.exports = {UserAuth,isAdmin}