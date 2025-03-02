const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const {
  PollyClient,
  SynthesizeSpeechCommand,
} = require("@aws-sdk/client-polly");
const cors = require("cors");
const connectToMongo = require("./config/db");
const Interview = require("./models/Interview");

connectToMongo();

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", require("./routes/auth"));
app.use("/api", require("./routes/resume"));
app.use("/genAi", require("./routes/genAi"));
app.use("/ML", require("./routes/ML"));

const pollyClient = new PollyClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const speakQuestion = async (socket, voiceId, question) => {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: question,
    VoiceId: voiceId || "Joanna",
  });
  try {
    const { AudioStream } = await pollyClient.send(command);
    const chunks = [];
    for await (const chunk of AudioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    socket.emit("tts-chunk", { audio: audioBuffer.toString("base64") });
  } catch (error) {
    console.error("Polly Error:", error);
  }
};

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let ques = [];
  let currentQuestionIndex = 0;

  socket.on("start-interview", async ({ interviewId }) => {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.error("Interview not found");
      return;
    }
    ques = interview.questions;
    socket.emit("interview-started", { message: "Interview started!" });
  });

  socket.on("next-ques", ({ voiceId }) => {
    socket.emit("interview-ended", { message: "Interview completed!" });
    // speakQuestion(socket, voiceId, ques[currentQuestionIndex].question);
  });

  socket.on("answer", ({ answer }) => {
    ques[currentQuestionIndex].answer = answer;
    currentQuestionIndex++;
    console.log(answer)
    if (currentQuestionIndex >= ques.length)
      socket.emit("interview-ended", { message: "Interview completed!" });
    else 
      socket.emit("answer-received", { message: "Answer received!" });
  });

  socket.on("end-interview", async ({ interviewId }) => {
    await Interview.findByIdAndUpdate(interviewId, { questions: ques });
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
