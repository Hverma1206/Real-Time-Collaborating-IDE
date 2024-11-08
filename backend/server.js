const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Room = require('./models/Room');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/users', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

io.on('connection', (socket) => {
  socket.on('join', async ({ roomId, username }) => {
    try {
      let room = await Room.findOne({ roomId });
      if (!room) {
        room = await Room.create({ roomId, users: [] });
      }

      let userRole = 'reader';
      const usersInRoom = await User.find({ roomId });

      if (usersInRoom.length === 0) {
        userRole = 'admin'; // First user is the admin
      } else if (usersInRoom.length === 1) {
        userRole = 'writer'; // Second user becomes the writer
      }

      const user = await User.create({
        username,
        socketId: socket.id,
        role: userRole,
        roomId,
      });

      room.users.push(user._id);
      await room.save();

      socket.join(roomId);
      const clients = await User.find({ roomId });
      io.in(roomId).emit('joined', { clients, joinedUser: username });

    } catch (error) {
      console.error("Error joining room:", error);
    }
  });

  socket.on('changeRole', async ({ targetSocketId, newRole }) => {
    try {
      const adminUser = await User.findOne({ socketId: socket.id });
      if (adminUser.role === 'admin') {
        const targetUser = await User.findOne({ socketId: targetSocketId });
        if (targetUser) {
          targetUser.role = newRole;
          await targetUser.save();

          const roomId = targetUser.roomId;
          const clients = await User.find({ roomId });
          io.in(roomId).emit('updateClients', { clients });
        }
      }
    } catch (error) {
      console.error("Error changing role:", error);
    }
  });

  socket.on('codeChange', async ({ roomId, code }) => {
    const user = await User.findOne({ socketId: socket.id });
    if (user && (user.role === 'admin' || user.role === 'writer')) {
      socket.to(roomId).emit('codeChange', { code });
    }
  });

  socket.on('leave', async ({ roomId, username }) => {
    try {
      await User.deleteOne({ socketId: socket.id });
      socket.leave(roomId);

      const clients = await User.find({ roomId });
      io.in(roomId).emit('left', { username });

      // If no users are left, remove the room
      if (clients.length === 0) {
        await Room.deleteOne({ roomId });
      }
    } catch (error) {
      console.error("Error leaving room:", error);
    }
  });

  socket.on('disconnecting', async () => {
    const rooms = Array.from(socket.rooms);
    const roomId = rooms[1];
    const user = await User.findOne({ socketId: socket.id });

    if (user) {
      await User.deleteOne({ socketId: socket.id });
      const username = user.username;

      const clients = await User.find({ roomId });
      io.in(roomId).emit('disconnected', { username });

      if (clients.length === 0) {
        await Room.deleteOne({ roomId });
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
