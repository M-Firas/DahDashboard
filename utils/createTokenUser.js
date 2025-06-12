const createTokenUser = (user) => {
    return {
        userId: user._id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        avatar: user.avatar
    };
};

module.exports = createTokenUser;
