const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});


const userSocketMap = {};


const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
  }));
};

io.on('connection', (socket) => {
// for join the room
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    const clients = getAllConnectedClients(roomId);
    
// admin role to first user, reader role to other user after admin (but reader role not working properly rn)
    userRoleMap[socket.id] = clients.length === 0 ? 'admin' : 'reader';
    socket.join(roomId);

    // toast message all user for who has joined
    io.in(roomId).emit('joined', {
      clients: getAllConnectedClients(roomId),
      joinedUser: username, 
    });
  });



// for code changes in real time
  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', { code });
  });


  // when a user leave
  socket.on('leave', ({ roomId, username }) => {
    socket.leave(roomId);
    delete userSocketMap[socket.id];
    delete userRoleMap[socket.id];
    io.in(roomId).emit('left', { username });
  })


  socket.on('disconnecting', () => {
    const roomId = Array.from(socket.rooms)[1]
    const username = userSocketMap[socket.id]
    delete userSocketMap[socket.id]
    delete userRoleMap[socket.id]

    io.in(roomId).emit('disconnected', { username })

  })
})


const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))