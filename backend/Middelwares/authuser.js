const jwt = require('jsonwebtoken')
const ErrorHandler = require('../utilis/errorhandel')
const User = require('../model/usermodel')
const A = require('./resolveandcatch')

exports.isAuthenticateuser = A(async(req, res, next) => { 
    let token = req.cookies.token; 
    if (!token && req.headers.authorization) { 
        token = req.headers.authorization.replace('Bearer ', ''); 
    } 
    if (!token) { 
        return next(new ErrorHandler('User token expired', 401)) 
    } 
    try { 
        const verifytoken = jwt.verify(token, process.env.SECRETID) 
        req.user = await User.findById(verifytoken.id) 
        if (!req.user) { 
            return next(new ErrorHandler('User not found', 404)) 
        } 
        next() 
    } catch (error) { 
        return next(new ErrorHandler('Invalid token', 401)) 
    } 
})