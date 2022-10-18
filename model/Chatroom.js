const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatroomSchema = new Schema({
    participants: Array,
    lastMessage: {
        type: String,
        require: false
    },
    unreadMessages: {
        type: Array,
        require: false
    },
    deleted: Array
}, { timestamps: true })

module.exports = mongoose.model('Chatroom', chatroomSchema)