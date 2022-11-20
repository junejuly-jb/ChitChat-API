const mongoose = require('mongoose')
const Schema = mongoose.Schema

const chatroomSchema = new Schema({
    participants: Array,
    typing: Array,
    chatroomClientID: String,
    theme: {
        type: String,
        default: 'rgb(69, 142, 247)',
        required: true,
    },
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