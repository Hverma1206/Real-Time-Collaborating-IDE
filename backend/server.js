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
const userRoleMap = {}; // Map to store roles for each user

// Helper function to get all clients in a specific room with roles
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
    socketId,
    username: userSocketMap[socketId],
    role: userRoleMap[socketId], // Get role from userRoleMap
  }));
};

io.on('connection', (socket) => {
  // User joins a room
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    const clients = getAllConnectedClients(roomId);
    
    // Assign "admin" role to the first user, "reader" to others
    userRoleMap[socket.id] = clients.length === 0 ? 'admin' : 'reader';
    socket.join(roomId);

    // Notify all clients in the room about the new user and roles
    io.in(roomId).emit('joined', {
      clients: getAllConnectedClients(roomId),
    });
  });

  // Handle role changes
  socket.on('changeRole', ({ targetSocketId, newRole }) => {
    if (userRoleMap[socket.id] === 'admin') { // Only admin can change roles
      userRoleMap[targetSocketId] = newRole;
      const roomId = Array.from(socket.rooms)[1]; // Get the room id
      io.in(roomId).emit('updateClients', {
        clients: getAllConnectedClients(roomId),
      });
    }
  });

  // Listen for code changes and broadcast within the room
  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', { code });
  });

  // Handle user leave and disconnection
  socket.on('leave', ({ roomId, username }) => {
    socket.leave(roomId);
    delete userSocketMap[socket.id];
    delete userRoleMap[socket.id];
    io.in(roomId).emit('left', { username });
  });

  socket.on('disconnecting', () => {
    const roomId = Array.from(socket.rooms)[1];
    const username = userSocketMap[socket.id];
    delete userSocketMap[socket.id];
    delete userRoleMap[socket.id];
    io.in(roomId).emit('disconnected', { username });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
