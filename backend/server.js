const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const { disconnect } = require('process');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

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
  socket.on('join', ({ roomId, username }) => {    const roomExists = io.sockets.adapter.rooms.has(roomId);

    if (!roomExists) {
      socket.emit('room_not_found', 'Room does not exist.');
      return;
    }

    userSocketMap[socket.id] = username;
    socket.join(roomId);
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
    const clients = getAllConnectedClients(roomId)

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit('left', { username })
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
    delete userSocketMap[socket.id]
  });
});

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))
