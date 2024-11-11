const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);
const io = new Server(server);
const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId].username, // Access `username` here
        };
    });
};


io.on("connection", (socket) => {
    socket.on("join", ({ roomId, username }) => {
        userSocketMap[socket.id] = { username, roomId };
        socket.join(roomId);
    
        const clients = getAllConnectedClients(roomId);
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit("joined", {
                clients,
                username,
                socketId: socket.id,
            });
        });
    });
    
    socket.on('code-change', ({ roomId, code }) => {
        socket.in(roomId).emit("code-change", { code });
    });

    socket.on('sync-code', ({ socketId, code }) => {
        io.to(socketId).emit("code-change", { code });
    });

    socket.on("newMessage", ({ username, message }) => {
        const roomId = userSocketMap[socket.id].roomId;
        io.to(roomId).emit("newMessage", { username, message });
    });

    socket.on("disconnect", () => {
        const { username, roomId } = userSocketMap[socket.id] || {};
        if (roomId) {
            socket.to(roomId).emit("userLeft", {
                socketId: socket.id,
                username,
            });
        }
        delete userSocketMap[socket.id];
    });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
