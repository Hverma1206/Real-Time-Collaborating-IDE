const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const socketConfig = require('./config/socket.config');
const { EVENTS, ROLES } = require('./constants/socket.constants');
const RoomService = require('./services/room.service');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, socketConfig);
const roomService = new RoomService(io);

io.on(EVENTS.CONNECTION, (socket) => {
  socket.on(EVENTS.JOIN, ({ roomId, username }) => {
    socket.join(roomId);
    const clients = roomService.addUser(socket.id, roomId, username);
    io.in(roomId).emit(EVENTS.JOINED, {
      clients,
      joinedUser: username
    });
  });

  socket.on(EVENTS.CHANGE_ROLE, ({ roomId, targetSocketId, newRole }) => {
    if (roomService.changeUserRole(roomId, socket.id, targetSocketId, newRole)) {
      io.in(roomId).emit(EVENTS.ROLE_CHANGED, {
        clients: roomService.getAllConnectedClients(roomId)
      });
    }
  });

  socket.on(EVENTS.CODE_CHANGE, ({ roomId, code }) => {
    socket.to(roomId).emit(EVENTS.CODE_CHANGE, { code });
  });

  socket.on(EVENTS.LANGUAGE_CHANGE, ({ roomId, language, code }) => {
    io.in(roomId).emit(EVENTS.LANGUAGE_CHANGE, { language });
    socket.to(roomId).emit(EVENTS.CODE_CHANGE, { code });
  });

  socket.on(EVENTS.LEAVE, ({ roomId }) => {
    socket.leave(roomId);
    const username = roomService.removeUser(socket.id, roomId);
    io.in(roomId).emit(EVENTS.LEFT, { username });
  });

  // Replace the disconnect event with disconnecting
  socket.on(EVENTS.DISCONNECTING, () => {
    const rooms = [...socket.rooms];
    rooms.forEach(roomId => {
      if (roomId !== socket.id) {  // Skip the default room
        const username = roomService.removeUser(socket.id, roomId);
        if (username) {
          io.to(roomId).emit(EVENTS.LEFT, { username });
        }
      }
    });
  });

  // Add disconnect event to clean up any remaining state
  socket.on('disconnect', () => {
    roomService.cleanupUserState(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));