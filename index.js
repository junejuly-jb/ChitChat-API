const express = require('express')
const mongoose = require('mongoose')
const dotevn = require('dotenv')
const cors = require('cors')
const app = express();
const apiRoutes = require('./api/api')

dotevn.config()

mongoose.connect(process.env.DB_CONNECT_LOCAL, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('Connect to database successfully!');
});

//Middlewares
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}))

//Routes
app.use('/api/v1', apiRoutes)
app.use(function(req, res, next) { 
    return res.status(404).json({
        success: false,
        status: 404,
        message: 'Route not found'
    })
});

//Server
const port = process.env.PORT || 5050 
app.listen(port, () => {
    console.log(`app is listening to port: ${port}`)
})