const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const bcrypt = require("bcryptjs")

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      minLength: 4,
      maxLength: 15,
      required: true,
    },
    lastName: {
      type: String,
      minLength: 2,
      maxLength: 15,
      required: true,
    },
     photoUrl: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid Photo URL: " + value);
        }
      },
    },
    photoId: {
      type: String,
      maxLength: 20,
      default: "", // cloudinary photoId for deletion
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    token: { type: String, default: null },
    otp: { type: String, default: null, maxLength: 6 },
    otpExpiry: {
      type: Date,
      default: null,
    },
    address: {
      type: String,
      maxLength: 50,
    },
    zipCode: { type: String, maxLength: 8 },
    city: { type: String, maxLength: 30 },
    phoneNo: { type: String, maxLength: 12 },
  },
  { timestamps: true }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
    expiresIn: "28d",
  });
  return token;
};

// userSchema.methods.accessJWT = async function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
//     expiresIn: "10d",
//   });
//   return token;
// };

// userSchema.methods.refreshJWT = async function () {
//   const user = this;
//   const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, {
//     expiresIn: "30d",
//   });
//   return token;
// };
userSchema.methods.validatePassword = async function (password) {
  const user = this;
  const isPasswordValid = await bcrypt.compare(password, user.password);
  return isPasswordValid;
};

const User = mongoose.model("User", userSchema);
module.exports = { User };
