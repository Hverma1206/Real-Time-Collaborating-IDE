const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors'); // Add CORS to handle cross-origin requests

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Replace with your React frontend URL
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId],
    };
  });
};

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId); // Automatically creates the room if it doesn't exist

    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('joined', {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on('leave', ({ roomId, username }) => {
    socket.leave(roomId);
    const clients = getAllConnectedClients(roomId);

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('left', { username });
    });

    delete userSocketMap[socket.id];
  });

  socket.on('disconnecting', () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit('disconnected', {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
