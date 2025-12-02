const nodemailer = require("nodemailer");
const VerifyEmail = async (token,emailId) => {


const transporter = await nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
  
const mailConfigurations = {
    // It should be a string of sender/server email
    from:process.env.EMAIL_USER,

    to: emailId,

    // Subject of Email
    subject: 'Email Verification',
    
    // This would be the text of email body
    text: `Hi! There, You have recetly visited our website and entered your email .
           Please follow the given link to verify your email 
           http://localhost:5173/auth/verify${token} 
           Thanks`
};

transporter.sendMail(mailConfigurations, function(error, info){
    if (error) throw Error(error);
    console.log('Email Sent Successfully');
    console.log(info);
});

}

module.exports = {VerifyEmail}