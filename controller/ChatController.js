const Chatroom = require("../model/Chatroom");
const Message = require("../model/Message");
const pusher = require("../pusher")
var ObjectId = require('mongoose').Types.ObjectId;

const addChatRoom = async (participants, sender) => {

    let room = await Chatroom.findOneAndUpdate({ $and: [{"participants._id": participants[0]._id},{"participants._id": participants[1]._id}]}, { upsert: true})
    if (room) {
        if(room.deleted.includes(sender)){
            room.deleted = room.deleted.filter( el => el !== sender)
            console.log(room.deleted)
            console.log(sender)
        }
    }
    else{
        room = new Chatroom({ participants })
    }

    try {
        await room.save();
        return { success: true, data: room }
    } catch (error) {
        return { success: false }
    }
}


const sendMessage = async (req, res) => {
    
    let { participants, chatRoomID, message} = req.body
    let chatroom
    
    if(chatRoomID.length == '0'){
        chatroom = await addChatRoom(participants, req.user._id)
        if(!chatroom.success) return res.status(500).json({ success: false, message: 'Error in sending message'})

        chatRoomID = chatroom.data._id
    }

    const people = [req.user._id, req.params.id]

    const newMessage = new Message({
        chatroomID: chatRoomID,
        sender: req.user._id,
        receiver: req.params.id,
        participants: people,
        message
    })
    
    try {
        await newMessage.save();

        chatroom = await Chatroom.findOneAndUpdate(
            { _id: chatRoomID }, 
            { lastMessage: message, $push: { unreadMessages: newMessage }, $pull: { deleted: req.params.id} }, 
            { new: true }
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
    const chatrooms = await Chatroom.find(
        { 
            "participants._id": req.user._id,
            deleted: {
                $nin: req.user._id
            }
        }
    ).sort([['updatedAt', -1]])
    let chats = [];

    chatrooms.map( (el) => {
        let chat = {
            _id: el._id,
            lastMessage: el.lastMessage,
            typing: el.typing,
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

//TODO: SENDMESSAGE if the chatroom is deleted on the other end

const getMessages = async (req, res) => {
    const messages = await Message.find(
        { chatroomID: req.params.chatroomid, participants: req.user._id, $or: [ { sender: req.user._id }, 
        { receiver: req.user._id } ] }).sort([['createdAt', -1]])
    return res.status(200).json({ success: true, data: messages })
}

const deleteMessage = async (req, res) => {
    try {
        await Chatroom.findOneAndUpdate(
            {'_id': new ObjectId(req.params.chatroomid)},
            {
                $push: { 
                    deleted: req.user._id
                }
            }
        )
        await Message.updateMany({ chatroomID: req.params.chatroomid }, {
            $pull: {
                participants: req.user._id
            }
        })
        return res.status(200).json({ success: true, status: 200, message: 'Message deleted successfully' })
    } catch (error) {
        return res.status(500).json({ success: false, status: 500, message: error.message })
    }
}

const readMessages = async (req, res) => {
    try {
        const chatroom = await Chatroom.findOneAndUpdate(
            { _id: new ObjectId(req.params.chatroomid) },  
            {
                $pull :{
                    unreadMessages: { receiver: new ObjectId(req.user._id) }
                }
            },
            { new: true, multi: true }
        )
        return res.status(200).json({ success: true, message: "Messages read successfully", chatroom})
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message })
    }
}

module.exports = { sendMessage, getChatrooms, getMessages, deleteMessage, readMessages }