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

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-room", () => {
    console.log("➡️ join-room:", socket.id);

    if (waitingUser) {
      console.log("🔗 Matching:", waitingUser.id, socket.id);

      const roomID = `${waitingUser.id}-${socket.id}`;

      socket.join(roomID);
      waitingUser.join(roomID);

      waitingUser.emit("match-found", {
        roomID,
        initiator: true,
      });

      socket.emit("match-found", {
        roomID,
        initiator: false,
      });

      console.log("✅ Match emitted, room:", roomID);

      waitingUser = null;
    } else {
      console.log("⏳ Waiting user set:", socket.id);
      waitingUser = socket;
    }
  });

  socket.on("signal", ({ roomID, signal }) => {
    console.log("📡 Signal from", socket.id, "to room", roomID);
    socket.to(roomID).emit("signal", signal);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }
  });
});


server.listen(5000, () => {
  console.log("Socket server running on 5000");
});
