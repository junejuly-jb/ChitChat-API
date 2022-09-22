const mongoose = require('mongoose')
const Schema = mongoose.Schema

const messageSchema = new Schema({
    chatroomID: mongoose.Types.ObjectId,
    message: String,
    sender: mongoose.Types.ObjectId,
    receiver: mongoose.Types.ObjectId
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)