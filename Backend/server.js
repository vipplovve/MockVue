const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.emit("receiveData", "Start speaking...");

  socket.on("transcribedText", (data) => {
    console.log("Received from client:", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


app.get("/", (req, res) => {
    res.send("Hello");
});


server.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
