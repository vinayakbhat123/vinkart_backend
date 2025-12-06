const express = require("express");
const { isAdmin, UserAuth } = require("../middleware/userauth");
const cloudinary = require("../utils/cloudinary"); // already exports v2 instance
const { multipleUpload } = require("../middleware/multer");
const { getDataUri } = require("../utils/datauri");
const Product = require("../models/productModel");

const productRouter = express.Router();

productRouter.post(
  "/addproduct",
  UserAuth,
  isAdmin,
  multipleUpload,
  async (req, res) => {
    try {
      const { productName, productDesc, productPrice, category, brand } =
        req.body;
      const user = req.user;
      if (
        !productName ||
        !productDesc ||
        !productPrice ||
        !category ||
        !brand
      ) {
        return res.status(400).json({
          success: false,
          message: "All fields are required",
        });
      }
      // handle multiple image uploads
      let productImg = [];
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const fileUri = await getDataUri(file);
          const result = await cloudinary.uploader.upload(fileUri, {
            folder: "mern_products", // cloudinary folder name
          });
          productImg.push({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
        const newProduct = await Product.create({
          userId: user._id,
          productName,
          productDesc,
          productImg, // array of images [{url,public_id},{url,public_id},...]
          productPrice,
          category,
          brand,
        });
        return res.status(200).json({
          success: true,
          message: "Product added successfully",
          product: newProduct,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

productRouter.get("/getallproducts", async (req, res) => {
  try {
    const products = await Product.find();
    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No Products Found...",
        products: [],
      });
    }
    return res.status(200).json({
      success: true,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

productRouter.delete(
  "/deleteproduct/:productId",
  UserAuth,
  isAdmin,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await product.findById(productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          message: "Product Not Found",
        });
      }
      // delete images from cloudinary
      if (product.productImg && product.productImg.length > 0) {
        for (let img of product.productImg) {
          const result = await cloudinary.uploader.destroy(img.public_id);
        }
      }
      // delete product from database
      await Product.findByIdAndDelete(productId);
      return res.status(200).json({
        success: true,
        message: "product deleted",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

productRouter.put(
  "/updateproduct/:productId",
  UserAuth,
  isAdmin,
  multipleUpload,
  async (req, res) => {
    try {
      const { productId } = req.params;
      const {
        productName,
        productDesc,
        productPrice,
        category,
        brand,
        existingImages,
      } = req.body;
      const product = await product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "product Not Found",
        });
      }
      let updatedImages = [];
      // keep selected existing images
      if (existingImages && existingImages.length > 0) {
        const keepIds = JSON.parse(existingImages);
        updatedImages = product.productImg.filter((img) =>
          keepIds.includes(img.public_id)
        );

        //delete only removed images
        const removeImages = product.productImg.filter(
          (img) => !keepIds.includes(img.public_id)
        );
        for (let img of removeImages) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      } else {
        updatedImages = product.productImg;
      }

      //upload new images
      if (req.files && req.files.length > 0) {
        for (let file of req.files) {
          const fileuri = await getDataUri(file);
          const result = await cloudinary.uploader.upload(fileuri, {
            folder: "mern_products",
          });
          updatedImages.push({
            url: result.secure_url,
            pubclic_id: result.public_id,
          });
        }
      }
      // update product details
      product.productName = productName || product.productName;
      product.productDesc = productDesc || product.productDesc;
      product.productPrice = productPrice || product.productPrice;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.productImg = updatedImages;
      await product.save();
      return res.status(200).json({
        success:true,
        message: "product Updated Successfully",
        product
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

module.exports = { productRouter };
