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

const rooms = {};
const socketRoomMap = {};

const getAllConnectedClients = (roomId) => {
  if (!rooms[roomId]) {
    return [];
  }

  return Object.entries(rooms[roomId].clients).map(([socketId, userData]) => ({
    socketId,
    username: userData.username,
    role: userData.role,
    isAdmin: userData.isAdmin
  }));
};

io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);

  socket.on('join', ({ roomId, username }) => {
    console.log(`User ${username} (${socket.id}) joining room ${roomId}`);

    if (socketRoomMap[socket.id]) {
      const oldRoomId = socketRoomMap[socket.id];
      console.log(`User ${username} leaving previous room ${oldRoomId} to join ${roomId}`);

      if (oldRoomId !== roomId) {
        handleUserLeaving(socket, oldRoomId);
      } else {
        console.log(`User ${username} is rejoining the same room ${roomId}`);
      }
    }

    socketRoomMap[socket.id] = roomId;

    if (!rooms[roomId]) {
      rooms[roomId] = {
        clients: {},
        adminSocketId: null,
        adminUsername: null
      };
    }

    socket.join(roomId);

    const isFirstUser = Object.keys(rooms[roomId].clients).length === 0;
    const isReturningAdmin = username === rooms[roomId].adminUsername;

    if (isFirstUser) {
      rooms[roomId].adminSocketId = socket.id;
      rooms[roomId].adminUsername = username;

      rooms[roomId].clients[socket.id] = {
        username,
        role: 'writer',
        isAdmin: true
      };
    } else if (isReturningAdmin) {
      rooms[roomId].adminSocketId = socket.id;

      rooms[roomId].clients[socket.id] = {
        username,
        role: 'writer',
        isAdmin: true
      };
    } else {
      rooms[roomId].clients[socket.id] = {
        username,
        role: 'reader',
        isAdmin: false
      };
    }

    io.to(roomId).emit('joined', {
      clients: getAllConnectedClients(roomId),
      joinedUser: username
    });
  });

  socket.on('changeRole', ({ roomId, targetSocketId, newRole }) => {
    if (rooms[roomId] && rooms[roomId].adminSocketId === socket.id) {
      if (rooms[roomId].clients[targetSocketId]) {
        rooms[roomId].clients[targetSocketId].role = newRole;

        io.to(roomId).emit('roleChanged', {
          clients: getAllConnectedClients(roomId)
        });
      }
    }
  });

  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeChange', { code });
  });

  socket.on('languageChange', ({ roomId, language, code }) => {
    io.to(roomId).emit('languageChange', { language });
    socket.to(roomId).emit('codeChange', { code });
  });

  socket.on('sendMessage', ({ roomId, message, sender, timestamp }) => {
    io.to(roomId).emit('receiveMessage', {
      message,
      sender,
      timestamp
    });
  });

  socket.on('typing', ({ roomId, user }) => {
    socket.to(roomId).emit('userTyping', { user });
  });

  socket.on('stopTyping', ({ roomId, user }) => {
    socket.to(roomId).emit('userStoppedTyping', { user });
  });

  socket.on('leave', ({ roomId, username }) => {
    console.log(`User ${username} (${socket.id}) is leaving room ${roomId}`);

    handleUserLeaving(socket, roomId);

    if (socketRoomMap[socket.id] === roomId) {
      delete socketRoomMap[socket.id];
    }
  });

  socket.on('disconnecting', () => {
    console.log(`Socket ${socket.id} disconnecting`);
    const socketRooms = Array.from(socket.rooms);

    for (let i = 1; i < socketRooms.length; i++) {
      const roomId = socketRooms[i];
      console.log(`Socket ${socket.id} is leaving room ${roomId} due to disconnection`);
      handleUserLeaving(socket, roomId);
    }

    delete socketRoomMap[socket.id];
  });

  function handleUserLeaving(socket, roomId) {
    if (rooms[roomId] && rooms[roomId].clients[socket.id]) {
      const username = rooms[roomId].clients[socket.id].username;
      const wasAdmin = rooms[roomId].clients[socket.id].isAdmin;

      console.log(`Cleaning up user ${username} from room ${roomId}`);

      delete rooms[roomId].clients[socket.id];
      socket.leave(roomId);

      if (Object.keys(rooms[roomId].clients).length === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} deleted - no more users`);
      }
      else if (wasAdmin) {
        const remainingSocketIds = Object.keys(rooms[roomId].clients);
        if (remainingSocketIds.length > 0) {
          const newAdminSocketId = remainingSocketIds[0];
          const newAdminUsername = rooms[roomId].clients[newAdminSocketId].username;

          console.log(`Assigning new admin ${newAdminUsername} in room ${roomId}`);

          rooms[roomId].adminSocketId = newAdminSocketId;
          rooms[roomId].adminUsername = newAdminUsername;
          rooms[roomId].clients[newAdminSocketId].isAdmin = true;
          rooms[roomId].clients[newAdminSocketId].role = 'writer';
        }
      }

      if (rooms[roomId]) {
        io.to(roomId).emit('left', {
          username,
          clients: getAllConnectedClients(roomId)
        });
        console.log(`Notified users in room ${roomId} that ${username} left`);
      }

      return true;
    }
    return false;
  }
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));