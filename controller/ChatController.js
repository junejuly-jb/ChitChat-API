const Chatroom = require("../model/Chatroom");
const Message = require("../model/Message");
const pusher = require("../pusher")

const addChatRoom = async (participants) => {
    const newChatRoom = new Chatroom({ participants })

    try {
        await newChatRoom.save();
        return { success: true, data: newChatRoom }
    } catch (error) {
        return { success: false }
    }
}


const sendMessage = async (req, res) => {
    let { participants, chatRoomID, message} = req.body
    let chatroom
    
    if(chatRoomID.length == '0'){
        chatroom = await addChatRoom(participants, message)
        if(!chatroom.success) return res.status(500).json({ success: false, message: 'Error in sending message'})

        chatRoomID = chatroom.data._id
    }

    const newMessage = new Message({
        chatroomID: chatRoomID,
        sender: req.user._id,
        receiver: req.params.id,
        message
    })
    
    try {
        await newMessage.save();

        chatroom = await Chatroom.findOneAndUpdate(
            { _id: chatRoomID }, 
            { lastMessage: message, $push: { unreadMessages: newMessage } }, 
            { new: true}
        ).lean()

        let chatRoomForTrigger = {...chatroom}
        chatRoomForTrigger.participants.map( el => {
            if(el._id == req.user._id){
                chatRoomForTrigger.user = el
            }
        })
        chatRoomForTrigger.messages = []

        chatroom.participants.map( user => {
            if(user._id != req.user._id){
                chatroom.user = user
            }
        })
        chatroom.messages = []

        pusher.trigger("chitchat", "chat-" + req.params.id, { data: newMessage, chatroom: chatRoomForTrigger } );
        return res.status(200).json({ success: true, message: 'Message sent', data: newMessage, chatroom})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message})
    }
}

const getChatrooms = async (req, res) => {
    const chatrooms = await Chatroom.find({ "participants._id": req.user._id }).sort([['updatedAt', -1]])
    let chats = [];

    chatrooms.map( (el) => {
        let chat = {
            _id: el._id,
            lastMessage: el.lastMessage,
            createdAt: el.createdAt,
            updatedAt: el.updatedAt,
            unreadMessages: el.unreadMessages
        }
        el.participants.map( user => {
            if(user._id != req.user._id){
                chat.user = user
            }
        })
        chats.push(chat)
    })

    return res.status(200).json({ success: true, data: chats })
}


const getMessages = async (req, res) => {
    const messages = await Message.find({ chatroomID: req.params.chatroomid, $or: [ { sender: req.user._id }, { receiver: req.user._id } ] }).sort([['createdAt', -1]])
    return res.status(200).json({ success: true, data: messages })
}

const deleteMessage = async (req, res) => {
    try {
        const result = await Chatroom.deleteMany({ _id: req.params.chatroomid, "participants._id": req.user._id })
        if(result.deletedCount == 0)
        return res.status(500).json({ success: false, message: "Error deleting message" })

        await Message.deleteMany({ chatroomID: req.params.chatroomid })
        return res.status(200).json({ success: true, message: "Messages deleted successfully!!! "})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

const readMessages = async (req, res) => {
    try {
        await Chatroom.updateOne({ _id: req.params.id},{
            $pullAll:{
                unreadMessages: [{ receiver: req.user._id }]
            }
        })
        return res.status(200).json({ success: true, message: "Messages read successfully"})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { sendMessage, getChatrooms, getMessages, deleteMessage, readMessages }