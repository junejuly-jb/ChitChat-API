const api = require('express').Router();

const UserController = require('../controller/AuthController')

api.post('/register', UserController.register)
api.post('/login', UserController.login)

module.exports = api