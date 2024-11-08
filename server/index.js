const express = require('express');
const app = express();
const http = require('http');
const { Server } = require("socket.io");

const PORT = process.env.PORT || 5001;

const server = http.createServer(app);

const io = new Server(server);

const ACTIONS=require("./Action");

const userSocketMap = {};

const getAllConnectedClients = (roomId) => {
    return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
        return {
            socketId,
            username: userSocketMap[socketId],
        };
    });
};

io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.on("join", ({ roomId, username }) => {
        userSocketMap[socket.id] = { username, roomId }; // Store roomId with username
        socket.join(roomId);
    
        const clients = getAllConnectedClients(roomId); // Get all clients in the room
        clients.forEach(({ socketId }) => {
            io.to(socketId).emit("joined", {
                clients:clients,
                username:username,
                socketId: socket.id,
            });
        });
    });
    
     socket.on('code-change',({roomId,code})=>{
        socket.in(roomId).emit("code-change",{code});

     });

     socket.on('sync-code',({socketId,code})=>{
        io.to(socketId).emit("code-change",{code});
        
     });

    socket.on("disconnect", () => {
        const { username, roomId } = userSocketMap[socket.id] || {}; // Retrieve roomId and username
        if (roomId) {
            console.log(`Emitting Disconnected event for ${username} in room ${roomId}`);
            socket.to(roomId).emit("userLeft", {
                socketId: socket.id,
                username,
            });
        }
        delete userSocketMap[socket.id]; // Remove the user from the map
    });
    

    // socket.on("join", ({roomId, username}) => {
    //     userSocketMap[socket.id] = username;
    //     socket.join(roomId);
    //     const clients = getAllConnectedClients(roomId); //getALLConnectedClients(roomId);
    //     clients.forEach(({ socketId }) => {
    //         io.to(socketId).emit("joined", {
    //             clients,
    //             username,
    //             socketId: socket.id,
    //         });
    //     });
    // });
    // socket.on("disconnect", () => {
    //     console.log(`User disconnected: ${socket.id}`);
    //     const rooms = [...socket.rooms];
    //     rooms.forEach((roomId) => {
    //         socket.to(roomId).emit("userLeft", {  //yha in
    //             socketId: socket.id,
    //             username: userSocketMap[socket.id],
    //         });
    
    //     });
    //     // const roomId = [...socket.rooms][1]; // The room ID is the second item (the first is the socket's own room)
    //     // if (roomId) {
    //     //     console.log(`Emitting Disconnected event for ${userSocketMap[socket.id]} in room ${roomId}`);
    //     //     socket.to(roomId).emit("userLeft", {
    //     //         socketId: socket.id,
    //     //         username: userSocketMap[socket.id],
    //     //     });
    //     // }
        
    //     delete userSocketMap[socket.id];
    //   //  socket.leave();//ye hm lgaye hai
    // });
});


server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));