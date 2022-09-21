const Pusher = require('pusher')
const dotevn = require('dotenv')
dotevn.config()

const pusher = new Pusher({
    appId: process.env.P_APP_ID,
    key: process.env.P_KEY,
    secret: process.env.P_SECRET,
    cluster: process.env.P_CLUSTER,
    useTLS: true
})

module.exports = pusher