const sendEmail = require('./sendEmail');
const template = require('./otpTemplate');

const sendOTPVerificationEmail = async ({ name, email, otp }) => {
  const html = template.replace('{{name}}', name).replace('{{otp}}', otp);

  return sendEmail({
    to: email,
    subject: 'DashDah - Email Verification',
    html,
  });
};

module.exports = sendOTPVerificationEmail;
