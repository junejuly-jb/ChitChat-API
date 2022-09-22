const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) { 
    const authorization = req.headers.authorization
    if(authorization){
        const token = req.headers.authorization.split(' ')[1]
        try {
            const verify = jwt.verify(token, process.env.PASS_PHRASE)
            req.user = verify
            next()
        } catch (err) { 
            return res.status(401).json({
                success: false,
                status: 401,
                message: 'invalid token or session has been expired. Please login to continue'
            })
        }
    }
    else{
        return res.status(401).json({
            success: false,
            status: 401,
            message: 'Incomplete header'
        })
    }
}