# Real-Time Collaborating IDE

This repository contains the full-stack implementation of a real-time collaborative IDE. The project is divided into two main parts:

- **Backend**: A Node.js-based server that handles real-time collaboration via WebSockets.
- **Frontend**: A React.js application providing a collaborative code editor interface.

## Features

- Real-time code synchronization
- Multiple user collaboration
- Role-based access control (Reader/Writer)
- Auto-admin assignment for the first user
- Language switching support

## Tech Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: React.js, Socket.IO Client

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

## Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/Real-Time-Collaborating-IDE.git
cd Real-Time-Collaborating-IDE
```

### Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

The frontend will run at `http://localhost:3000`, and the backend server will run at `http://localhost:5000` (default port).

## Project Structure

```
Real-Time-Collaborating-IDE/
│── backend/       # Backend server files
│── frontend/      # Frontend application files
│── README.md      # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

