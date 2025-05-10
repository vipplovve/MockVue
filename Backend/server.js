const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const fs = require("fs");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const { spawn } = require("child_process");
const os = require("os");

require("dotenv").config();
const {
  PollyClient,
  SynthesizeSpeechCommand,
} = require("@aws-sdk/client-polly");
const cors = require("cors");
const connectToMongo = require("./config/db");
const Interview = require("./models/Interview");

connectToMongo();
const pythonProcesses = new Map();
const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true, 
    methods: ["GET", "POST"],
  },
  path: "/socket.io",
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

const speakQuestion = async (socket, voiceId, ques) => {
  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text:
      ques.type === "Code"
        ? "A Question will be displayed on your screen , please read it carefully and write the pseudo code for it"
        : ques.question,
    VoiceId: voiceId || "Joanna",
  });
  try {
    const { AudioStream } = await pollyClient.send(command);
    const chunks = [];
    for await (const chunk of AudioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);
    socket.emit("tts-chunk", {
      audio: audioBuffer.toString("base64"),
      type: ques.type,
      question: ques.type === "Code" ? ques.question : null,
    });
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
    let output = "";

    const interviewDir = path.join(__dirname, "uploads", interviewId);
    if (!fs.existsSync(interviewDir)) {
      fs.mkdirSync(interviewDir, { recursive: true });
    }
     const command = os.platform() === "win32" ? "../venv/Scripts/python.exe" : "../venv/bin/python3";
    let pythonProcess = spawn(command, [
      path.join(__dirname, "../ML/scripts", "frameAnalyzer.py"),
      interviewId,
    ]);
    pythonProcesses.set(interviewId, { process: pythonProcess, output: "0" });
    pythonProcess.stdout.on("data", (data) => {
      console.log("Python script avg score:", data.toString());
      pythonProcesses.set(interviewId, {
        process: pythonProcess,
        output: data.toString(),
      });
    });
  });

  socket.on("next-ques", ({ voiceId }) => {
    if (ques[currentQuestionIndex].type === "Code") {
      socket.emit("code-question", {
        question: ques[currentQuestionIndex].question,
      });
      speakQuestion(socket, voiceId, {
        question: ques[currentQuestionIndex].question,
        type: "Code",
      });
    } else {
      speakQuestion(socket, voiceId, {
        question: ques[currentQuestionIndex].question,
        type: "Oral",
      });
    }
  });

  socket.on("answer", ({ answer, audio }) => {
    ques[currentQuestionIndex].answer = answer;
    if (audio !== null) {
      const base64Data = audio.replace(/^data:audio\/\w+;base64,/, "");
      const audioBuffer = Buffer.from(base64Data, "base64");
      const fileName = `audio_answer_${Date.now()}.webm`;
      const filePath = path.join(__dirname, "uploads", fileName);
      fs.writeFileSync(filePath, audioBuffer);
      ques[currentQuestionIndex].audioFile = fileName;
    }
    currentQuestionIndex++;
    if (currentQuestionIndex >= ques.length)
      socket.emit("interview-ended", { message: "Interview completed!" });
    else socket.emit("answer-received", { message: "Answer received!" });
  });

  socket.on("end-interview", async ({ interviewId }) => {
    const processEntry = pythonProcesses.get(interviewId);
    if (processEntry) {
      processEntry.process.kill("SIGINT");
      console.log("output -> ", processEntry.output);
      const finalOutput = processEntry.output.trim().split("\n").pop();
      const finalScore = parseFloat(finalOutput) || 0.0;
      await Interview.findByIdAndUpdate(interviewId, {
        questions: ques,
        videoScore: finalScore,
      });
      pythonProcesses.delete(interviewId);
    }
  });
  socket.on("video-frame", ({ frameData, interviewId }) => {
    const base64Data = frameData.replace(/^data:image\/jpeg;base64,/, "");

    const uploadDir = path.join(__dirname, "uploads", interviewId);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `frame_${Date.now()}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    fs.writeFile(filePath, base64Data, "base64", (err) => {
      if (err) {
        console.error("Error saving frame:", err);
      }
    });
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
