const mongoose = require("mongoose");
const { Schema } = mongoose;

const interviewSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  role: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ["fresher", "intermediate", "experienced"],
    required: true,
  },
  questions: [
    {
      question: { type: String, required: true },
      type: { type: String, enum: ["Code", "Oral"], required: true },
      answer: { type: String , default: "" },
      audioFile: { type: String, default: "" },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Interviews", interviewSchema);
