const sendEmail = require('./sendEmail');
const template = require('./otpTemplate');

const sendVerificationEmailOTP = async ({ name, email, otp }) => {
  const title = "Email Verification Code";
  const purpose = "verify your email";
  const welcoming = "Thank you for registering"

  const html = template
    .replace('{{name}}', name)
    .replace('{{welcoming}}', welcoming)
    .replace('{{otp}}', otp)
    .replace('{{title}}', title)
    .replace('{{purpose}}', purpose);

  return sendEmail({
    to: email,
    subject: 'DashDah - Email Verification',
    html,
  });
};

module.exports = sendVerificationEmailOTP;

