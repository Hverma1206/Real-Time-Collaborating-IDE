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

// Helper function to get all clients in a specific room
const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
};

io.on('connection', (socket) => {
  // User joins a room
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    // Notify current clients in the room of the new user
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', {
        clients,
        username,
        socketId: socket.id,
      });
    });

    // Send initial code to the new user
    socket.to(roomId).emit('requestCode');
    socket.on('responseCode', (code) => {
      socket.emit('initCode', { code });
    });
  });

  // Listen for code changes and broadcast within the room
  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', { code });
  });

  // User leaves the room
  socket.on('leave', ({ roomId, username }) => {
    socket.leave(roomId);
    delete userSocketMap[socket.id];

    // Notify other clients in the room
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('left', { username });
    });
  });

  // Handle user disconnection
  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      io.to(roomId).emit('disconnected', { username: userSocketMap[socket.id] });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
