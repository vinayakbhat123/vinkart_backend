const express = require("express");
const mongoose = require("mongoose");
const { UserAuth } = require("../middleware/userauth");
const Products = require("../models/productModel");
const Cart = require("../models/cart");
const cartRouter = express.Router();

// get cart
cartRouter.get("/getcart", UserAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Correct query — search by userId field
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({
        success: true,
        message: "Cart is empty",
        cartItems: [],
      });
    }

    return res.status(200).json({
      success: true,
      cart: cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

cartRouter.post("/addtocart", UserAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    // Validate productId
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const product = await Products.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [], totalPrice: 0 });
    }

    const itemsIndex = cart.items.findIndex((item) => {
      const id = item.productId._id ? item.productId._id : item.productId;
      return id.toString() === productId.toString();
    });

    if (itemsIndex > -1) {
      cart.items[itemsIndex].quantity += 1;
      cart.items[itemsIndex].price = product.productPrice;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
        price: product.productPrice,
      });
    }

    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();

    // Populate the correct path
    await cart.populate({
      path: "items.productId", // this must match the schema exactly
      select: "productName productPrice productImg",
    });

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

cartRouter.put("/updatecart", UserAuth, async (req, res) => {
  try {
    const user = req.user;
    const { productId, type } = req.body;

    // find the cart for user
    const cart = await Cart.findOne({ userId: user._id });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart Not Found" });

    // Find the product
    const cartItem = cart?.items?.find(
      (item) => item.productId.toString() === productId.toString()
    );

    if (!cartItem) {
      return res
        .status(404)
        .json({ success: false, message: "Product Not Found in Cart" });
    }

    // Change quantity
    if (type === "Increase") cartItem.quantity++;
    else if (type === "Decrease" && cartItem.quantity > 1) cartItem.quantity--;

    // Update total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await cart.save();
    const populatedCart = await cart.populate("items.productId");

    return res.status(200).json({
      success: true,
      message: "Product Updated Successfully",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

cartRouter.delete("/removecartitem", UserAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body; // FIXED: Destructuring

    // 1. Validation
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Product ID format" });
    }

    // 2. Find the cart
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    // 3. Find index of item to remove
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    // 4. Remove the item using splice
    cart.items.splice(itemIndex, 1);

    // 5. Recalculate Total Price
    // Note: Ensure your 'items' have a 'price' field or populate it from the Product model
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // 6. Save and Populate
    // It is better practice to save first, then populate the result
    await cart.save();

    const cartItems = await cart.populate("items.productId");

    return res.status(200).json({
      success: true,
      message: "Item removed successfully",
      cart: cartItems, // Returning the full cart object covers more use cases
    });
  } catch (error) {
    console.error("Remove Cart Item Error:", error); // Log error on server, not just return
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

module.exports = { cartRouter };
