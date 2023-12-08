import { Server } from "socket.io/dist/index.js";
import ErrorClass from "./ErrorClass.js";


let io;

export const initIo = (server) => {
    io = new Server(server, {
        cors: '*'
    })
    return io
}

export const getIo = () => {
    if (!io) {
        throw new ErrorClass('invalid socket connection')
    }
    return io
}