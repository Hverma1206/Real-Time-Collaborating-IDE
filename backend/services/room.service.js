class RoomService {
  constructor(io) {
    this.io = io;
    this.userSocketMap = {};
    this.userRoleMap = {};
    this.roomAdmins = {};
  }

  getAllConnectedClients(roomId) {
    return Array.from(this.io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => ({
      socketId,
      username: this.userSocketMap[socketId],
      role: this.userRoleMap[socketId] || 'reader',
      isAdmin: this.roomAdmins[roomId] === socketId
    }));
  }

  addUser(socketId, roomId, username) {
    this.userSocketMap[socketId] = username;
    const clients = this.getAllConnectedClients(roomId);
    
    if (clients.length === 0) {
      this.roomAdmins[roomId] = socketId;
      this.userRoleMap[socketId] = 'writer';
    } else {
      this.userRoleMap[socketId] = 'reader';
    }

    return this.getAllConnectedClients(roomId);
  }

  handleUserLeave(socketId) {
    const rooms = Object.keys(this.io.sockets.adapter.sids.get(socketId) || {}).filter(
      (room) => room !== socketId
    );
    
    const results = rooms.map(roomId => ({
      roomId,
      username: this.removeUser(socketId, roomId)
    }));

    this.cleanupUserState(socketId);

    return results;
  }

  cleanupUserState(socketId) {
    if (this.userSocketMap[socketId]) {
      delete this.userSocketMap[socketId];
      delete this.userRoleMap[socketId];
      
      Object.keys(this.roomAdmins).forEach(roomId => {
        if (this.roomAdmins[roomId] === socketId) {
          delete this.roomAdmins[roomId];
        }
      });
    }
  }

  removeUser(socketId, roomId) {
    const username = this.userSocketMap[socketId];
    if (username) {
      if (this.roomAdmins[roomId] === socketId) {
        delete this.roomAdmins[roomId];
      }
    }
    return username;
  }

  changeUserRole(roomId, adminSocketId, targetSocketId, newRole) {
    if (this.roomAdmins[roomId] === adminSocketId) {
      this.userRoleMap[targetSocketId] = newRole;
      return true;
    }
    return false;
  }

  isAdmin(roomId, socketId) {
    return this.roomAdmins[roomId] === socketId;
  }
}

module.exports = RoomService;
