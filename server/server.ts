import express from "express";
import http from "http";
import { Server } from "socket.io";
import type { Request, Response } from "express";
import ACTIONS from "./Actions";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req: Request, res: Response) => {
  res.send("server is running");
});

const userSocketMap: Record<string, string> = {};
const roomCodeMap: Record<string, string> = {};


function getAllConnectedClients(roomId: string) {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      userName: userSocketMap[socketId]
    }
  })
}

io.on("connection", (socket) => {
  console.log("socket connected:", socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, userName }: { roomId: string, userName: string }) => {
    userSocketMap[socket.id] = userName;
    socket.join(roomId);
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        userName,
        socketId: socket.id,
      })
    })

    if (roomCodeMap[roomId]) {
      socket.emit(ACTIONS.SYNC_CODE, {
        code: roomCodeMap[roomId]
      })
    }
  })

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];


    rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          userName: userSocketMap[socket.id]
        })
      }
    })
    delete userSocketMap[socket.id];
  })

  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {

    roomCodeMap[roomId] = code;

    socket.to(roomId).emit(ACTIONS.SYNC_CODE, {
      code,
    })
  });

  socket.on(ACTIONS.LEAVE, ({ roomId }) => {
    socket.leave(roomId);
    delete userSocketMap[socket.id];
    const clients = getAllConnectedClients(roomId);
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.DISCONNECTED, {
        socketId: socket.id,
        userName: userSocketMap[socket.id]
      })
    });
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});