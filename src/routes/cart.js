const express = require("express");
const { UserAuth } = require("../middleware/userauth");

const cartRouter = express.Router();

// get cart 
cartRouter.get("/getcart",UserAuth, async(req,res) => {
  try{
    const userId = req.user._id;
    const cartItems = await cartRouter.findOne({userId}).populate("productId");
    if(!cartItems){
      return res.json({
        success:true,
        message:"Cart is empty",
        cartItems:[]
      });
    }
    return res.status(200).json({
      success:true,
      cartItems
    });
  }catch(error){
    return res.status(500).json({
      success:false,
      message:error.message
    })
  }
}) 

cartRouter.post("/addtocart", UserAuth, async (req, res) => {
  try {
    
  } catch (error) {
    return res.status(500).json({
      success:false,
      messsage:error.message 
    })
    
  }
})

module.exports = {cartRouter};