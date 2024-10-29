const express = require('express')
const {Server} = require('socket.io')
const app = express()
const http = require('http')
const server = http.createServer(app)
const io = new Server(server)

const userSocketMap = {}
const getAllCOnnectedClients = (roomId) =>{
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      }
    }
  )
}


io.on("connection" , (socket) => {

  socket.on('join', ({roomId, username}) =>{
   userSocketMap[socket.id] = username
   socket.join(roomId)
   const clients = getAllCOnnectedClients(roomId)
   clients.forEach(({socketId})=>{
    io.to(socketId).emit('joined'),{
      clients,
      username,
      socketId :socket.id
    }

   }
  )    
  })
})
const PORT = process.env.PORT || 5000
server.listen(PORT, ()=> console.log("Server is running"))