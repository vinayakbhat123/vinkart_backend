# Steps to create Backend - development:-
 - Create package.json file -> npm init
 - change script in json add "start": "node src/app.js" 
 # Install express nodemon jsonwebtoken mongoose - > npm i express, -g nodemon, jsonwebtoken, mongoose,validator
 - require mongoose and create a server.
 # Install dotenv library  -> npm i dotenv --save
     - require("dotenv").config()
  # Install Cookie- parser -> npm i cookie-parser
 - Created db.js file for database -> MongoDB
 - Created MongoDB account and cluster 
     - Network access -> IP access List -> ADD ip address - > Allow access from anywhere
 - Created database connection in db.js 
 - created models Folder - > user.js
     - User model  
 # Installed validator library - > npm i validator
 - created utils Folder -> ValidateData.js = > ValidateSignUp()
 - Create a authRouter -> /signup API and connect to app.js page
 - Added app.use(express.json())  in app.js
 - Created instances of User and  user.save()

 # Install bcryptjs -> npm i bcryptjs
   - make passwordhash using bcrypt.hash()
 # Install Nodemailer - > for sending mails
    - npm i nodemailer
    - created emailVerify.js file 
    - use code from references Only  https://www.geeksforgeeks.org/node-js/email-verification/
    - Username and Password not accepted when using nodemailer? - Stack Overflow https://share.google/RKHVoov4gjctbfM1b 
    - create passkeys for mail and 2 step verifications 
    - Email sent successfully
  - created /auth/verify API 
  - created /auth/reverify API
  - created userSchema.methods.getJWT() = function () {}
  - Created /Login api 
  - created sessionModel and ref to "User"
  - Creating github repository
  - created /logout api
  - creating  /forget password api 
  - created /auth/verifyotp api
  - created /auth/changepassword api
  - created /userRouter with /allusers and /getuserdata api
  # Install cors
    - npm i cors
       - app.use(cors({origin,credentils})) in app.js 
  