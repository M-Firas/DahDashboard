const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            to,
            from: process.env.EMAIL_USER,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        return { success: true, info };
    } catch (error) {
        return { success: false, error };
    }
};

module.exports = sendEmail;
