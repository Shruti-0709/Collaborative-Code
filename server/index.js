// const express = require('express');
// const app = express();
// const http = require('http');
// const { Server } = require("socket.io");

// const PORT = process.env.PORT || 5001;

// const server = http.createServer(app);
// const io = new Server(server);
// const userSocketMap = {};

// const getAllConnectedClients = (roomId) => {
//     return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
//         return {
//             socketId,
//             username: userSocketMap[socketId].username, // Access `username` here
//         };
//     });
// };


// io.on("connection", (socket) => {
//     socket.on("join", ({ roomId, username }) => {
//         userSocketMap[socket.id] = { username, roomId };
//         socket.join(roomId);
    
//         const clients = getAllConnectedClients(roomId);
//         clients.forEach(({ socketId }) => {
//             io.to(socketId).emit("joined", {
//                 clients,
//                 username,
//                 socketId: socket.id,
//             });
//         });
//     });
    
//     socket.on('code-change', ({ roomId, code }) => {
//         socket.in(roomId).emit("code-change", { code });
//     });

//     socket.on('sync-code', ({ socketId, code }) => {
//         io.to(socketId).emit("code-change", { code });
//     });

//     socket.on("newMessage", ({ username, message }) => {
//         const roomId = userSocketMap[socket.id].roomId;
//         io.to(roomId).emit("newMessage", { username, message });
//     });

//     socket.on("disconnect", () => {
//         const { username, roomId } = userSocketMap[socket.id] || {};
//         if (roomId) {
//             socket.to(roomId).emit("userLeft", {
//                 socketId: socket.id,
//                 username,
//             });
//         }
//         delete userSocketMap[socket.id];
//     });
// });

// server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const Code = require('./models/Code'); // Import the Code model
const cors = require('cors');

const PORT = process.env.PORT || 5001;

// MongoDB Connection String (hardcoded for now)
const mongoURI = 'mongodb+srv://shrutishreya0709:XN6djBN8B8Z5pIck@cluster0.lotvg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

const app = express();
const server = http.createServer(app);

// Create Socket.IO instance with CORS configuration
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Frontend is running on localhost:3000
    methods: ['GET', 'POST'],
    credentials: true // Allow cookies if needed
  }
});

const userSocketMap = {};

// Middleware to parse JSON requests
app.use(express.json());

// CORS middleware to allow cross-origin requests for HTTP requests
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from frontend
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// MongoDB Connection (hardcoded)
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
    return {
      socketId,
      username: userSocketMap[socketId].username, // Access `username` here
    };
  });
};

io.on("connection", (socket) => {
  socket.on("join", async ({ roomId, username }) => {
    userSocketMap[socket.id] = { username, roomId };
    socket.join(roomId);

    // Fetch the code from MongoDB for the room if it exists
    let codeData = await Code.findOne({ roomId });
    if (codeData) {
      socket.emit("code-change", { code: codeData.code });
    } else {
      // If no code found for the room, send an empty string
      socket.emit("code-change", { code: "" });
    }

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
    // Save the code to MongoDB
    Code.findOneAndUpdate(
      { roomId },
      { code },
      { upsert: true, new: true }, // If roomId doesn't exist, create it
      (err, result) => {
        if (err) {
          console.error("Error saving code:", err);
          socket.emit("error", { message: "Failed to save code" }); // Send error to client
        } else {
          socket.in(roomId).emit("code-change", { code });
        }
      }
    );
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
    if (roomId && username) {  // Only emit if username and roomId are valid
      socket.to(roomId).emit("userLeft", {
        socketId: socket.id,
        username,
      });
    }
    delete userSocketMap[socket.id];
  });
});

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
