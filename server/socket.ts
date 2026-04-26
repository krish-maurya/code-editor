import { io } from "socket.io-client";

export const initSocket = async () => {
    const options = {
        transports: ["websocket"],
        forceNew: true,
        reconnectionAttempts: Infinity,
        timeout: 10000,
    };

    return io(process.env.NEXT_PUBLIC_BACKEND_URL!, options);
}