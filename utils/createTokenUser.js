const createTokenUser = (user) => {
    return {
        userId: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar
    };
};

module.exports = createTokenUser;
