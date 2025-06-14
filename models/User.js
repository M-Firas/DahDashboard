const mongoose = require('mongoose')
const validator = require("validator");
const bcrypt = require('bcryptjs');
const CustomError = require("../errors");

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'please provide an email'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'please provide a valid email',
        },
    },
    password: {
        type: String,
        required: [true, 'please provide a password'],
    },
    fullName: {
        type: String,
        required: [true, 'please provide the full name'],
    },
    username: {
        type: String,
        unique: true,
        required: [true, 'please provide a username!'],
    },
    avatar: {
        type: String,
        default: "https://t4.ftcdn.net/jpg/02/15/84/43/360_F_215844325_ttX9YiIIyeaR7Ne6EaLLjMAmy4GvPC69.jpg"
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verified: Date,
    verificationOTP: {
        type: String,
    },
    verificationOTPExpires: {
        type: Date,
    },
    forgetPasswordOTP: {
        type: String,
    },
    forgetPasswordOTPExpires: {
        type: Date,
    },
    isOtpVerified: {
        type: Boolean,
        default: false
    }
});

// Virtual field for confirmPassword
UserSchema.virtual('confirmPassword')
    .set(function (value) {
        this._confirmPassword = value;
    })
    .get(function () {
        return this._confirmPassword;
    });

// Hashing the password
UserSchema.pre('save', async function (next) {
    // If the password field is not modified, skip hashing
    if (!this.isModified('password')) return next();
    // Check if the passwords match (this._confirmPassword comes from virtual field)
    if (this.password !== this._confirmPassword) {
        throw new CustomError.BadRequestError('Passwords do not match');
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Comparing the passwords
UserSchema.methods.comparePassword = async function (userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};


module.exports = mongoose.model('User', UserSchema);
