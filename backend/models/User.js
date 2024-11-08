const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'writer', 'reader'],
    default: 'reader',
  },
  socketId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('User', userSchema);
