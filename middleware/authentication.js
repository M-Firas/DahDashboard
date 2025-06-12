const CustomError = require('../errors')
const { isTokenValid } = require('../utils')

const { cookiesToResponse } = require('../utils')


const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;

    //checking if the token exists
    if (!token) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

    //authenticating the user
    try {
        const { username, userId, email } = isTokenValid({ token })
        req.user = { username, userId, email };
        next()
    } catch (error) {
        throw new CustomError.UnauthenticatedError('Authentication Invalid')
    }

    cookiesToResponse({
        res,
        user: payload.user,
    })

}





module.exports = {
    authenticateUser,
}