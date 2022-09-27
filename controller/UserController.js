const User = require("../model/User");

const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).send(error.message)
    }
}

const test = (req, res) => {
    console.log(req.body)
    console.log('im here')
    return res.status(200).send('hey')
}


module.exports = { getUsers, test }