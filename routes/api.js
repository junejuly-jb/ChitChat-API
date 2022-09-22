const api = require('express').Router();
const auth = require('../middleware/auth')
const AuthController = require('../controller/AuthController')
const ChatController = require('../controller/ChatController')

//auth
api.post('/register', AuthController.register)
api.post('/login', AuthController.login)

//messaging
api.post('/send/:id', auth, ChatController.sendMessage)
api.get('/chatrooms', auth, ChatController.getChatrooms)
api.get('/message/:chatroomid', auth, ChatController.getMessages)
api.delete('/message/:chatroomid', auth, ChatController.deleteMessage)

module.exports = api