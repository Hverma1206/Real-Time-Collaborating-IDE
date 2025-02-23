const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');

const app = express();
app.use(cors());  

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  
    methods: ["GET", "POST"],
    credentials: true
  },
});

const userSocketMap = {};
const userRoleMap = {};
const roomAdmins = {};
const roomAdminUsers = {}; // New object to track admin by username

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
    role: userRoleMap[socketId] || 'reader',
    isAdmin: roomAdminUsers[roomId] === userSocketMap[socketId]
  }));
};

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    const clients = getAllConnectedClients(roomId);

    if (clients.length === 0) {
      // First user becomes admin
      roomAdminUsers[roomId] = username;
      roomAdmins[roomId] = socket.id;
      userRoleMap[socket.id] = 'writer';
    } else {
      // Check if this user was the admin
      if (roomAdminUsers[roomId] === username) {
        roomAdmins[roomId] = socket.id;
        userRoleMap[socket.id] = 'writer';
      } else {
        userRoleMap[socket.id] = 'reader';
      }
    }
    socket.join(roomId);

    io.in(roomId).emit('joined', {
      clients: getAllConnectedClients(roomId),
      joinedUser: username
    });
  });

  socket.on('changeRole', ({ roomId, targetSocketId, newRole }) => {
    if (roomAdmins[roomId] === socket.id) { 
      userRoleMap[targetSocketId] = newRole;
      io.in(roomId).emit('roleChanged', {
        clients: getAllConnectedClients(roomId)
      });
    }
  });

  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', { code });
  });

  socket.on('languageChange', ({ roomId, language, code }) => {
    io.in(roomId).emit('languageChange', { language });
    socket.to(roomId).emit('codeChange', { code });
  });

  socket.on('sendMessage', ({ roomId, message, sender, timestamp }) => {
    // Broadcast the message to all clients in the room, including sender
    io.in(roomId).emit('receiveMessage', {
      message,
      sender,
      timestamp
    });
  });

  socket.on('leave', ({ roomId, username }) => {
    socket.leave(roomId);
    const user = username;
    delete userSocketMap[socket.id];
    delete userRoleMap[socket.id];

    if (roomAdmins[roomId] === socket.id) {
      delete roomAdmins[roomId];
      // Only delete roomAdminUsers if the admin is actually leaving, not refreshing
      if (!Array.from(io.sockets.adapter.rooms.get(roomId) || []).some(
        socketId => userSocketMap[socketId] === username
      )) {
        delete roomAdminUsers[roomId];
      }
    }

    io.in(roomId).emit('left', { username: user });
  });

  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms);
    const roomId = rooms[1]; 
    const username = userSocketMap[socket.id];

    if (roomId && username) {
      delete userSocketMap[socket.id];
      delete userRoleMap[socket.id];

      if (roomAdmins[roomId] === socket.id) {
        delete roomAdmins[roomId];
        // Only delete roomAdminUsers if no other socket with same username exists
        if (!Array.from(io.sockets.adapter.rooms.get(roomId) || []).some(
          socketId => userSocketMap[socketId] === username
        )) {
          delete roomAdminUsers[roomId];
        }
      }

      io.in(roomId).emit('disconnected', { username });
    }
  });
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))