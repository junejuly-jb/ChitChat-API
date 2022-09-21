const api = require('express').Router();

const UserController = require('../controller/AuthController')

api.post('/register', UserController.register)



module.exports = api