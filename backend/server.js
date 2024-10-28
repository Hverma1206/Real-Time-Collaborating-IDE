const express = require('express')
const {Server} = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const userSocketMap = {}
const getAllCOnnectedClients = (roomId) =>{
  return io.sockets.adapter.rooms.get(roomId)
}


io.on("connection" , (socket) => {
  // console.log(`User connected : ${socket.id}`)

  socket.on('join', ({roomId, username}) =>{
   userSocketMap[socket.id] = username
   socket.join(roomId)
   const clients = getAllCOnnectedClients(roomId)
  })
})
const PORT = process.env.PORT || 5000
server.listen(PORT, ()=> console.log("Server is running"))