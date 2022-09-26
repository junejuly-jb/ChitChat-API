const User = require("../model/User");

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).send(error.message)
    }
}


module.exports = { getUsers }