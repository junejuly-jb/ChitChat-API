const User = require("../model/User")
const bcrypt = require('bcryptjs')
const { registrationValidation } = require('../helpers')
const pusher = require('../pusher')

const register = async (req, res) => {
    const { email, name, password, confirmPassword } = req.body

    //validation
    const { error } = registrationValidation({ name, email, password, confirmPassword })
    if(error)
    return res.status(400).json({ success: false, message: error.details[0].message })

    //check if user exists
    const exists = await checkUserExists(email)
    if(exists)
    return res.status(403).json({ success: false, status: 403, message: 'User already exists'})

    //password hashing
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const newUser = new User({name, email, password: hash, initials: getInitials(name)})

    try {
        await newUser.save();
        pusher.trigger("chitchat-registration", "new-user", { data: newUser } );
        return res.status(200).json({ success: true, message: 'User registered successfully'})
    } catch (error) {
        return res.status(400).json({ "success": false, "message": error.message });
    }
}


const checkUserExists = async (userEmail) => {
    let foundUser = await User.findOne({ email: userEmail })
    return foundUser
}

const getInitials = (string) => {
    var names = string.split(' '),
        initials = names[0].substring(0, 1).toUpperCase();

    if (names.length > 1) {
        initials += names[names.length - 1].substring(0, 1).toUpperCase();
    }
    return initials;
}

module.exports = { register }