const User = require("../models/User");
const { createTokenUser, cookiesToResponse, sendVerificationEmailOTP, sendResetPasswordOTP } = require('../utils')
const { StatusCodes } = require("http-status-codes");
const bcrypt = require('bcryptjs');
const CustomError = require("../errors");



// user register controller 
const register = async (req, res) => {
    let { email, fullName, username, password, confirmPassword } = req.body;

    email = email?.trim();
    fullName = fullName?.trim();
    username = username?.replace(/\s+/g, '');
    password = password?.trim();
    confirmPassword = confirmPassword?.trim();

    if (!email || !fullName || !username || !password || !confirmPassword) {
        throw new CustomError.BadRequestError("please provide all values!");
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
        throw new CustomError.BadRequestError("email is taken!");
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
        throw new CustomError.BadRequestError("username is taken!");
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!passwordRegex.test(password)) {
        throw new CustomError.BadRequestError(
            "Password must be at least 8 characters long, include uppercase, lowercase, and a special character."
        );
    }

    const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Constructing the new user
    const newUser = new User({
        username,
        fullName,
        email,
        password,
        verificationOTP: hashedOtp,
        verificationOTPExpires: Date.now() + 10 * 60 * 1000,
    });

    // Attaching confirmPassword virtual field
    newUser.confirmPassword = confirmPassword;

    // Adding uploaded image if present
    if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`; // auto-detects production URL
        newUser.avatar = `${baseUrl}/uploads/${req.file.filename}`;
    }


    await sendVerificationEmailOTP({ name: newUser.fullName, email, otp });
    await newUser.save();

    res.status(StatusCodes.CREATED).json({
        msg: "Account Created Successfully, please check your email to verify your account",
    });
};


// verfiy email controller
const verfiyEmail = async (req, res) => {
    const { email, otp } = req.body

    // checking if the user has provided email
    if (!email || !otp) {
        throw new CustomError.BadRequestError("please enter all the fields!")
    }


    // checking if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.NotFoundError("no user found with the provided email!")
    }

    // checking if the OTP is still valid
    if (Date.now() > user.verificationOTPExpires) {
        throw new Error("OTP has expired.");
    }

    // checking if the OTP is Correct
    const isMatch = await bcrypt.compare(otp, user.verificationOTP);
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
        throw new CustomError.UnauthenticatedError("invalid email or password!")
    }

    // checking if the user is verified
    if (!user.isVerified) {
        // creating and hashing OTP
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`
        const hashedOtp = await bcrypt.hash(otp, 10);

        user.verificationOTP = hashedOtp
        user.verificationOTPExpires = Date.now() + 10 * 60 * 1000
        user.save()

        await sendVerificationEmailOTP({ name: user.fullName, email, otp })
        throw new CustomError.UnauthenticatedError('your account is not verified yet, a verification code has been sent to your email')
    }

    // attaching token cookie and signing the user in
    const tokenUser = createTokenUser(user);
    cookiesToResponse({ res, user: tokenUser })

    res.status(StatusCodes.OK).json({ user: tokenUser })

}

// forget password OTP controller 
const forgetPasswordOTP = async (req, res) => {
    const { email } = req.body;

    // checking if the user provided email value
    if (!email) {
        throw new CustomError.BadRequestError("please provide email!")
    }

    // checking if a user with the provided email exists
    const user = await User.findOne({ email })
    if (!user) {
        throw new CustomError.NotFoundError("no user found with the provided email!")
    }

    // creating and hashing OTP
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`
    const hashedOtp = await bcrypt.hash(otp, 10);

    // saving the hashed otp to the database and defining the expairy date
    user.forgetPasswordOTP = hashedOtp
    user.forgetPasswordOTPExpires = Date.now() + 10 * 60 * 1000

    // saving the new fields to user
    await user.save();

    // sending the OTP to user email
    await sendResetPasswordOTP({ name: user.fullName, email, otp })

    res.status(StatusCodes.OK).json({ msg: "please check your email to reset your password" });

}

// verify reset password OTP 
const verifyResetPasswordOTP = async (req, res) => {
    const { email, otp } = req.body;

    // checking if user provided all values
    if (!email || !otp) {
        throw new CustomError.BadRequestError("Please provide email and OTP!");
    }

    // cheking if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.NotFoundError("no user found with the provided email!");
    }

    // Checking if OTP is expired
    if (Date.now() > user.forgetPasswordOTPExpires) {
        throw new CustomError.BadRequestError("OTP has expired");
    }

    // checking if OTP is correct
    const isMatch = await bcrypt.compare(otp, user.forgetPasswordOTP);
    if (!isMatch) {
        throw new CustomError.BadRequestError("Invalid OTP");
    }

    // Setting isOTPVerified to true and clearing OTP values
    user.isOtpVerified = true;
    user.forgetPasswordOTP = "";
    user.forgetPasswordOTPExpires = '';
    await user.save();

    res.status(StatusCodes.OK).json({ msg: "OTP verified successfully" });
};

// reset password controller 
const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    // checking if user provided all values
    if (!email || !newPassword || !confirmPassword) {
        throw new CustomError.BadRequestError("All fields are required");
    }

    // cheking if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.NotFoundError("User not found");
    }

    // checking if the reset password OTP is verified
    if (!user.isOtpVerified) {
        throw new CustomError.UnauthenticatedError("OTP not verified");
    }

    // Validating password strength 
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!passwordRegex.test(newPassword)) {
        throw new CustomError.BadRequestError(
            "Password must be at least 8 characters long, include uppercase, lowercase, and a special character."
        );
    }

    // Updating password and reset the OTP flag
    user.password = newPassword;
    user.confirmPassword = confirmPassword;
    user.isOtpVerified = false;
    await user.save();

    res.status(StatusCodes.OK).json({ msg: "Password reset successfully" });
};

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
    logout,
    forgetPasswordOTP,
    resetPassword,
    verifyResetPasswordOTP
}