const User = require("../models/User");
const { createTokenUser, cookiesToResponse, sendOTPVerificationEmail } = require('../utils')
const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcryptjs');
const CustomError = require("../errors");



// user register controller 
const register = async (req, res) => {
    let { email, fullName, username, password, confirmPassword } = req.body;

    // removing any spaces before or after from user inputs
    email = email?.trim();
    fullName = fullName?.trim();
    username = username?.replace(/\s+/g, ''); // removing any spaces overall in username field
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();

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
    // setting the verificationOTP and verificationOTPExpires value to null
    user.verificationOTP = ""
    user.verificationOTPExpires = ""
    // saving the user
    await user.save()

    res.status(StatusCodes.OK).json({ msg: "Email has been verified successfully!" })
}


// user login controller 
const login = async (req, res) => {
    const { email, password } = req.body

    // checking if user provided all values
    if (!email || !password) {
        throw new CustomError.BadRequestError("please provide email and password!")
    }

    // cheking if the user exists
    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError.UnauthenticatedError("invalid email or password!")
    }

    //checking if the password is correct 
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new CustomError.UnauthenticatedError('Invaild Email or Password!')
    }

    // checking if the user is verified
    if (!user.isVerified) {
        throw new CustomError.UnauthenticatedError('please verifiy your email!')
    }

    // attaching token cookie and signing the user in
    const tokenUser = createTokenUser(user);
    cookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ user: tokenUser })

}

// user logout controller
const logout = async (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: 'none',
    });

    res.status(StatusCodes.OK).json({ msg: 'Successfully logged out' })

}


module.exports = {
    register,
    verfiyEmail,
    login,
    logout
}