const Chatroom = require("../model/Chatroom");
const Message = require("../model/Message");

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

    if(chatRoomID.length == '0'){
        const chatroom = await addChatRoom(participants)
        if(!chatroom.success)
        return res.status(500).json({ success: false, message: 'Error in sending message'})

        chatRoomID = chatroom.data._id
    }

    const newMessage = new Message({
        chatroomID: chatRoomID,
        sender: req.user._id,
        receiver: req.params.id,
        message
    })

    try {
        await newMessage.save()
        return res.status(200).json({ success: true, message: 'Message sent'})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message})
    }
}

const getChatrooms = async (req, res) => {
    const chatrooms = await Chatroom.find({ "participants._id": req.user._id })
    let chats = [];

    chatrooms.map( (el) => {
        let chat = {
            _id: el._id,
            createdAt: el.createdAt,
            updatedAt: el.updatedAt
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
    const messages = await Message.find({ chatroomID: req.params.chatroomid, $or: [ { sender: req.user._id }, { receiver: req.user._id } ] })
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

module.exports = { sendMessage, getChatrooms, getMessages, deleteMessage }