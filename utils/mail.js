const nodemailer = require('nodemailer');

exports.mailTransport = () => {
    var transport = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: process.env.MAILTRAP_USERNAME,
            pass: process.env.MAILTRAP_PASSWORD
        }
    });
    return transport;
}

exports.verifyEmail = async (req,res) => {
    const {userId, opt} = req.body
    if (!userId || !opt.trim()) return sendError(res, "yêu cầu không hợp lệ") 
}