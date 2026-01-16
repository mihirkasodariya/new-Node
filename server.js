// // "use strict"

// // import express, { json, urlencoded } from "express";
// // // import cors from "cors";
// // import apiRouter from "./src/routes/authRoutes.js";
// // import connectDB from "./db/dbconnect.js";

// // const dotenv = await import("dotenv");
// // dotenv.config({ quiet: true });


// // const app = express();
// // const port = process.env.PORT || 8001;

// // connectDB();

// // // app.use(cors());
// // app.use(json());
// // app.use(urlencoded({ extended: true }));


// // app.use("/api", apiRouter);

// // app.get('/sign-up', (req, res) => {
// //     res.send(`<h1>Walcom Tech News</h1>`);
// // });
// // app.listen(port, "0.0.0.0", () => {
// //     console.debug(`\x1b[32m✔ Server Started Successfully\x1b[0m \x1b[36m→ Now listening on Port: ${port}\x1b[0m`);
// // });



// "use strict";

// import express, { json, urlencoded } from "express";
// import cors from "cors";
// import apiRouter from "./src/routes/authRoutes.js";
// import connectDB from "./db/dbconnect.js";

// const dotenv = await import("dotenv");
// dotenv.config({ quiet: true });

// const app = express();
// const port = process.env.PORT || 8001;

// connectDB();


// const allowedOrigins = [
//   "http://localhost:1500",
//   "http://localhost:3001",
//   "http://127.0.0.1:1500",
//   "https://linkrhinos.com",
//   "https://admin.linkrhinos.com",
//   "https://api.linkrhinos.com"
// ];

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true);
//       if (allowedOrigins.includes(origin)) {
//         return callback(null, true);
//       }
//       return callback(new Error("CORS not allowed"));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );

// app.options("*", cors());

// app.use(json());
// app.use(urlencoded({ extended: true }));

// app.use("/api", apiRouter);

// app.get("/sign-up", (req, res) => {
//   res.send("<h1>Welcome Tech News</h1>");
// });

// app.listen(port, "0.0.0.0", () => {
//   console.log(`✔ Server Started Successfully → Port ${port}`);
// });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let waitingUser = null; 

io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  socket.on("join-room", () => {
    // 🛑 FIX 1: Agar user pehle se wait kar raha hai aur dobara join-room bheje
    if (waitingUser && waitingUser.id === socket.id) {
        console.log("⚠️ User is already waiting:", socket.id);
        return;
    }

    if (waitingUser) {
      // ✅ Match Found
      const roomID = `${waitingUser.id}-${socket.id}`;
      console.log(`🚀 Match Found: ${waitingUser.id} <--> ${socket.id}`);

      // Dono ko room me daalo
      socket.join(roomID);
      waitingUser.join(roomID);

      // Offer/Answer Initiate karo
      io.to(waitingUser.id).emit("match-found", { roomID, initiator: true });
      io.to(socket.id).emit("match-found", { roomID, initiator: false });

      waitingUser = null; // Queue clear karo
    } else {
      // ⏳ Koi nahi hai, waiting list me daalo
      waitingUser = socket;
      console.log("⏳ User waiting for match:", socket.id);
    }
  });

  socket.on("signal", (data) => {
    // Signal forward karo
    socket.to(data.roomID).emit("signal", data.signal);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User Disconnected:", socket.id);
    if (waitingUser === socket) {
      waitingUser = null;
    }
  });
});

server.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});