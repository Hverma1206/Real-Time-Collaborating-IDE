const express = require('express')
const {Server} = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

io.on("connection" , (socket) => {
  console.log(`User connected : ${socket.id}`)
})
const PORT = process.env.PORT || 5000
server.listen(PORT, ()=> console.log("Server is running"))