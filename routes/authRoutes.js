const express = require("express");
const router = express.Router();
const upload = require('../middleware/upload');
const { register, verfiyEmail, forgetPasswordOTP, verifyResetPasswordOTP, resetPassword, login, logout } = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

router.post('/register', upload.single('avatar'), register)
router.post('/verify-email', verfiyEmail)
router.post('/login', login)
router.post('/forget-password', forgetPasswordOTP)
router.post('/verify-otp', verifyResetPasswordOTP)
router.patch('/reset-password', resetPassword)
router.delete('/logout', authenticateUser, logout)

module.exports = router;