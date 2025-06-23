import { io } from "socket.io-client"

export const initSocket = async () => {
    const existingSocketId = localStorage.getItem('socketInstance');
    if (existingSocketId) {
        console.log(`Cleaning up existing socket: ${existingSocketId}`);
    }
    
    const option = {
        'force new connection': true,
        transports: ['websocket'],
        reconnectionAttempt: 'infinity',
        timeout: 10000,
    }
    
    const socket = io(process.env.REACT_APP_BACKEND_URL, option);
    
    socket.on('connect', () => {
        console.log(`Socket connected with ID: ${socket.id}`);
        localStorage.setItem('socketInstance', socket.id);
    });
    
    return socket;
}