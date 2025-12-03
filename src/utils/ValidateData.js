const validator = require("validator");
const ValidateSignUp = (req) => {
  const { firstName, lastName, emailId, password } = req.body;
  if (!firstName || !lastName) {
    throw new Error("Name is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password!");
  }
};
const ValidateLogin = (req) => {
  const {emailId,password} = req.body;
  if (!emailId || !password) {
    throw new Error("emailId and password is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("password not valid");
  }
}

const ValidateChangePassword = (newpassword,confirmpassword,emailId) => {
  if (newpassword !== confirmpassword) {
    throw new Error("emailId and password is not valid!");
  } else if (!validator.isEmail(emailId)) {
    throw new Error("Email is not valid!");
  } else if (!validator.isStrongPassword(newpassword) || !validator.isStrongPassword(confirmpassword)) {
    throw new Error("Enter a strong password");
  }
  if(!newpassword || !confirmpassword){
    throw new Error("All field are required")
  }
}
module.exports = {
  ValidateSignUp,
  ValidateLogin,
  ValidateChangePassword
};
