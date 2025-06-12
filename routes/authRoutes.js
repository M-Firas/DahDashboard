const express = require("express");
const router = express.Router();

const { register, verfiyEmail, login, logout } = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authentication");

router.post('/register', register)
router.post('/verify-email', verfiyEmail)
router.post('/login', login)
router.delete('/logout', authenticateUser, logout)

module.exports = router;