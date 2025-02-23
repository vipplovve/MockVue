const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();
const { PollyClient, SynthesizeSpeechCommand } = require("@aws-sdk/client-polly");

const port = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// AWS Polly Client (Text-to-Speech)
const pollyClient = new PollyClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Sample interview questions
const questions = [
  { id: 1, text: "Tell me about yourself" },
  { id: 2, text: "What are your strengths?" },
  { id: 3, text: "Describe a challenge you faced" },
];


io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  let currentQuestionIndex = 0;
  
  socket.emit("receiveData", "Start speaking...");
  
  
 // Function to send a question using AWS Polly
 async function speakQuestion(voiceId) {
  if (currentQuestionIndex >= questions.length) {
    console.log("✅ All questions completed.");
    socket.emit("interview-end", { message: "Interview completed!" });
    return;
  }

  const question = questions[currentQuestionIndex].text;
  console.log(`🎙️ Speaking Q${currentQuestionIndex + 1}: ${question}`);

  const command = new SynthesizeSpeechCommand({
    OutputFormat: "mp3",
    Text: question,
    VoiceId: voiceId || "Joanna",
  });

  try {
    const { AudioStream } = await pollyClient.send(command);

    // Convert Stream to Buffer
    const chunks = [];
    for await (const chunk of AudioStream) {
      chunks.push(chunk);
    }
    const audioBuffer = Buffer.concat(chunks);

    // Emit base64 encoded audio
    socket.emit("tts-chunk", { audio: audioBuffer.toString("base64") });
  } catch (error) {
    console.error("❌ Polly Error:", error);
  }
}

// Start the interview
socket.on("start-interview", (data) => {
  console.log("▶️ Starting interview...");
  speakQuestion(data.voiceId);
});


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
