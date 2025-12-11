const express = require("express");
const { UserAuth } = require("../middleware/userauth");
const { Products } = require("../models/productsModel");
const Cart = require("../models/cart");
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
    const userId = req.user._id;
    const {productId} = req.body;

    // Find the productId in Products Model
    const product = await Products.findOne({productId});
    if(!product){
      return res.status(404).json({
        success:false,
        message:"product Not Found"
      });
    }
    // Check if the product already exist in the cart
    let cart = await Cart.findOne({userId});

    // if cart not exist create a new cart
    if(!cart){
      //create a new cart 
      cart = new Cart.create({
        userId,
        items:[{
          productId,quantity:1,price:product.ProductsPrice
        }],
        totalPrice:product.ProductsPrice
      });

    } else{
      // if cart exist check if product exist in cart find the index of the product
      const itemsIndex = await Cart.items.findIndex((item => item.productId.toString() === productId));
      if(itemsIndex > -1) {
         //if product exits in cart just update the quantity and price
         cart.items[itemsIndex].quantity +=1
      }
      else{
        // if new product just push to items array
        cart.items.push({
          productId,quantity:1,price:product.ProductsPrice
        })
      }
      // update the total Price 
      cart.totalPrice += cart.items.reduce((acc,item) => acc + item.price * item.quantity)

      // save the cart
      await cart.save();
      // populate the product details
      const populatedCart = await cart.populate("items.productId");
      return res.status(200).json({
        success:true,
        message:"Product added to cart successfully",
        cart:populatedCart
      });

    }
  } catch (error) {
    return res.status(500).json({
      success:false,
      messsage:error.message 
    })
    
  }
})

module.exports = {cartRouter};