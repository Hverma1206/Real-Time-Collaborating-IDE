const EVENTS = {
  CONNECTION: 'connection',
  JOIN: 'join',
  JOINED: 'joined',
  CODE_CHANGE: 'codeChange',
  LANGUAGE_CHANGE: 'languageChange',
  CHANGE_ROLE: 'changeRole',
  ROLE_CHANGED: 'roleChanged',
  LEAVE: 'leave',
  LEFT: 'left',
  DISCONNECT: 'disconnect',
  DISCONNECTING: 'disconnecting',
  DISCONNECTED: 'disconnected'
};

const ROLES = {
  READER: 'reader',
  WRITER: 'writer'
};

module.exports = { EVENTS, ROLES };
