const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
  transports: ["websocket"],
});

let waitingUser = null;

io.on("connection", (socket) => {
  console.log("🟢 Connected:", socket.id);

  socket.on("join-room", () => {
    if (waitingUser && waitingUser.id === socket.id) return;

    if (waitingUser) {
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

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  socket.on("signal", ({ roomID, signal }) => {
    if (!signal) return;
    socket.to(roomID).emit("signal", signal);
  });

  socket.on("disconnect", () => {
    if (waitingUser?.id === socket.id) {
      waitingUser = null;
    }
  });
});

server.listen(5000, () => {
  console.log("✅ Socket server running on port 5000");
});
