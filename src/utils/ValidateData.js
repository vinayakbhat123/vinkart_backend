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
module.exports = {
  ValidateSignUp,
  ValidateLogin
};
