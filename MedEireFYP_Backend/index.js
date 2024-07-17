import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import fileRoutes from "./routes/fileRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { createChat, getChatByID } from "./controllers/chatController.js";
import http from "http";
import https from "https";

import { Server } from "socket.io";

import { createTunnel } from "tunnel-ssh";

const app = express();
app.use(express.json());

dotenv.config();

// CORS
const corsOptions = {
  origin: function (origin, callback) {
    if (origin === process.env.FRONTEND_URL) { 
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },

  methods: ["GET", "PUT", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204, // No Content
};
app.use(cors(corsOptions));

// SSH Tunnel
const tunnelOptions = {
  autoClose: true,
};
let serverOptions = {
  host: process.env.HOST,
  port: process.env.PORT2,
};
const sshOptions = {
  host: process.env.SSH_host,
  port: process.env.SSH_port,
  username: process.env.SSH_user,
  privateKey: process.env.SSH_privatekey,
};
const forwardOptions = {
  srcAddr: process.env.HOST,
  dstAddr: process.env.SSH_dest_host,
  dstPort: process.env.PORT2,
};
let [server, conn] = await createTunnel(
  tunnelOptions,
  serverOptions,
  sshOptions,
  forwardOptions
);

server.on("connection", (connection) => {});

// Routing
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/chat", chatRoutes);

// Live Chat

// let protocolServer = ''
const httpServer = http.createServer(app);

// // Create server
// const protocol = process.env.Protocol;
// let httpOrHttps;
// if (protocol === "http") {
//   httpOrHttps = http;
//   protocolServer = httpOrHttps.createServer(app);

// } else {
//   httpOrHttps = https;
//   const options = {
//     key: process.env.privkey,
//     cert: process.env.fullchain
//   }
//   protocolServer = httpOrHttps.createServer(options)
// }

// Create socket.io instance
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
});


// Listen to connection event
io.on("connection", (socket) => {
  socket.on("join room", async ({ senderID, receiverID }) => {
    const chat = await getChatByID(senderID, receiverID);

    if (chat !== false) {
      socket.join(chat.chats[0].chatID);

      socket.emit("chat history", chat.chats[0].messages);
    } else {
      return;
    }
  });

  // Listen to "message" event
  socket.on("message", async (message) => {
    const chat = await createChat(message);

    // Join room
    socket.join(chat.newChat.chatID);

    // Emit "message" event to the chat room that the sender and receiver belong to
    socket.to(chat.newChat.chatID).emit("message", message);
  });

  // Listen to disconnection event
  socket.on("disconnect", () => {
    return;
  });
});

const PORT = process.env.SERVERPORT;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
