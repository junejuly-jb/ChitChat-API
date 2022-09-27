const api = require('express').Router();
const auth = require('../middleware/auth')
const AuthController = require('../controller/AuthController')
const ChatController = require('../controller/ChatController')
const UserController = require('../controller/UserController')

//auth
api.post('/register', AuthController.register)
api.post('/login', AuthController.login)
api.post('/logout', auth, AuthController.logout)
api.post('/pusher/user-auth', auth, AuthController.authPusher)

//user
api.get('/users', auth, UserController.getUsers)
api.post('/test', UserController.test)

//messaging
api.post('/send/:id', auth, ChatController.sendMessage)
api.get('/chatrooms', auth, ChatController.getChatrooms)
api.get('/message/:chatroomid', auth, ChatController.getMessages)
api.delete('/message/:chatroomid', auth, ChatController.deleteMessage)

module.exports = api