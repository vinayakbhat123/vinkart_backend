const nodemailer = require("nodemailer");
const SendOTP = async (otp,emailId) => {


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
    subject: 'Password Reset OTP ',
    
    // This would be the text of email body
    html:`<p>Your OTP for password reset is<b> ${otp}</b></p>`
};

transporter.sendMail(mailConfigurations, function(error, info){
    if (error) throw Error(error);
    console.log('OTP Sent Successfully');
    console.log(info);
});

}

module.exports = {SendOTP}