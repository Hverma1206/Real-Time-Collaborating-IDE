# Real-Time Collaborating IDE Backend

A Node.js-based backend server that enables real-time code collaboration using WebSocket technology.

## Features

- Real-time code synchronization
- Multiple user collaboration
- Role-based access control (Reader/Writer)
- Auto-admin assignment for first user
- Language switching support

## Tech Stack

- Node.js
- Express.js
- Socket.IO
- CORS enabled

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## WebSocket Events

### Client -> Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join` | `{ roomId, username }` | Join a collaboration room |
| `changeRole` | `{ roomId, targetSocketId, newRole }` | Change user's role (admin only) |
| `codeChange` | `{ roomId, code }` | Broadcast code changes |
| `languageChange` | `{ roomId, language, code }` | Switch programming language |
| `leave` | `{ roomId, username }` | Leave collaboration room |

### Server -> Client

| Event | Payload | Description |
|-------|---------|-------------|
| `joined` | `{ clients, joinedUser }` | New user joined notification |
| `roleChanged` | `{ clients }` | Role update notification |
| `codeChange` | `{ code }` | Code sync notification |
| `languageChange` | `{ language }` | Language change notification |
| `left` | `{ username }` | User left notification |
| `disconnected` | `{ username }` | User disconnection notification |

## Role System

- First user joining a room becomes admin
- Admin can change other users' roles
- Default role for new users is 'reader'
- Available roles: 'reader', 'writer'

## License

MIT
