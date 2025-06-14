const sendEmail = require('./sendEmail');
const template = require('./otpTemplate');

const sendResetPasswordOTP = async ({ name, email, otp }) => {
    const title = "Reset Password Code";
    const purpose = "reset your password";
    const welcoming = "Hey there"

    const html = template
        .replace('{{name}}', name)
        .replace('{{welcoming}}', welcoming)
        .replace('{{otp}}', otp)
        .replace('{{title}}', title)
        .replace('{{purpose}}', purpose);

    return sendEmail({
        to: email,
        subject: 'DashDah - Reset Password',
        html,
    });
};

module.exports = sendResetPasswordOTP;