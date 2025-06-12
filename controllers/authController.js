const User = require("../models/User");
const { sendOTPVerificationEmail } = require('../utils')
const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcryptjs');
const CustomError = require("../errors");



// user register controller 
const register = async (req, res) => {
    const { email, fullName, username, password, confirmPassword } = req.body

    // checking if all the values are provided
    if (!email || !fullName || !username || !password || !confirmPassword) {
        throw new CustomError.BadRequestError("please provide all values!");
    }

    // checking if a user with the provided email exists
    const emailExists = await User.findOne({ email })
    if (emailExists) {
        throw new CustomError.BadRequestError("email is taken!");
    }

    // checking if a user with the provided username exists
    const usernameExists = await User.findOne({ username })
    if (usernameExists) {
        throw new CustomError.BadRequestError("username is taken!")
    }

    // Validating password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
        throw new CustomError.BadRequestError(
            "Password must be at least 8 characters long, include uppercase, lowercase, and a special character."
        );
    }

    // creating and hashing OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`
    const hashedOtp = await bcrypt.hash(otp, 10);


    const newUser = new User({
        username,
        fullName,
        email,
        password,
        verificationOTP: hashedOtp,
        verificationOTPExpires: Date.now() + 10 * 60 * 1000
    });
    newUser.confirmPassword = confirmPassword;

    // sending the OTP to user email
    await sendOTPVerificationEmail({ name: newUser.fullName, email, otp })

    // saving the user
    await newUser.save();
    res.status(StatusCodes.CREATED).json({ msg: "Account Created Successfully, please check your email to verify your account" });
}

// verfiy email controller
const verfiyEmail = async (req, res) => {
    const { email, verificationOTP } = req.body

    // checking if the user has provided email
    if (!email || !verificationOTP) {
        throw new CustomError.BadRequestError("please enter all the fields!")
    }


    // checking if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.UnauthenticatedError('user does not exist!')
    }

    // checking if the OTP is still valid
    if (Date.now() > user.verificationOTPExpires) {
        throw new Error("OTP has expired.");
    }

    // checking if the OTP is Correct
    const isMatch = await bcrypt.compare(verificationOTP, user.verificationOTP);
    if (!isMatch) {
        throw new CustomError.UnauthenticatedError('OTP is incorrect!');
    }

    // verifying the user
    user.isVerified = true,
        user.verified = Date.now()
    // setting the verificationtoken value to empty
    user.verificationOTP = ""

    // saving the user
    await user.save()

    res.status(StatusCodes.OK).json({ msg: "Email has been verified successfully!" })
}


// user login controller 
const login = async (req, res) => {

    res.status(StatusCodes.OK).json("login controller")
}

// user logout controller
const logout = async (req, res) => {

}


module.exports = {
    register,
    verfiyEmail,
    login,
    logout
}