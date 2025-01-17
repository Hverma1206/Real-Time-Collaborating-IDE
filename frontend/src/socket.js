import { io } from "socket.io-client"
export const initSocket = async () => {
    const option = {
        'force new connection': true,
        transports: ['websocket'],
        'reconnectionAttempt': 'infinity',
        timeout: 10000,
    }
    return io(process.env.REACT_APP_BACKEND_URL, option)
}