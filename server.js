const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const userRoutes = require("./Routes/userRoutes");
const bookRoutes = require("./Routes/bookRoutes");
const offerRoutes = require("./Routes/offerRoutes");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
});

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  cors({
    // origin: process.env.FRONTEND_URL,
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//Routing Middlewares
app.use("/api/user", userRoutes);
app.use("/api/book", bookRoutes);
app.use("/api/offer", offerRoutes);

mongoose.connect(process.env.MONGO_URI).then(() => {
  server.listen(5000, () => {
    console.log("Server Running on Port 5000.");
    console.log("MongoDB Connected!");
  });
});



global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");
  global.chatSocket = socket;

  socket.on("add-user", ({userId}) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-message", ({ message, recipientId, senderId }) => {
    const sendUserSocket = onlineUsers.get(recipientId);
  
    if (sendUserSocket) {
      console.log("Recipient found");
      io.to(sendUserSocket).emit("receive-message", { message, recipient:  recipientId, sender : senderId });
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});
