const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    })
);


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
}));

app.use(passport.initialize());
app.use(passport.session());
app.use("/auth", require("./routes/auth"));
app.use("/api", require("./routes/resume"));



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

server.listen(process.env.SOCKET_PORT || 3001, () => {
  console.log("Socket Server running");
});

app.listen(process.env.API_PORT || 3000, () => {
  console.log(`API Server running`);
});
