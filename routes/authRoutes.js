const express = require("express");
const router = express.Router();

const { register, verfiyEmail, forgetPasswordOTP, verifyResetPasswordOTP, resetPassword, login, logout } = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

router.post('/register', register)
router.post('/verify-email', verfiyEmail)
router.post('/login', login)
router.post('/forget-password', forgetPasswordOTP)
router.post('/verify-otp', verifyResetPasswordOTP)
router.patch('/reset-password', resetPassword)
router.delete('/logout', authenticateUser, logout)

module.exports = router;