const mongoose = require('mongoose')
const { Socket } = require('socket.io')

const userSchema = new mongoose.Schema({
    username : {type :  String, required: true},
    SocketId : {type: String, required: true},
    role: {type: String, required : true},
    roomID: {type : String, required: true},
})
const User = mongoose.model('User', schema)
module.exports = User 