const axios = require("axios");
const User = require("../models/User");
const { exec } = require("child_process");
const path = require("path");
const os = require("os");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

const getRoleFromGemini = async (resumeText) => {
  try {
    const allowedRoles = [
      "Software Engineer",
      "Data Scientist",
      "ML Engineer",
      "Hardware Engineer",
      "DevOps Engineer",
    ];

    const prompt = `
      Based on the following resume, determine the best matching job role.
      Choose only from the following options: ${allowedRoles.join(", ")}.
      Respond with only the job role name and nothing else.
      
      Resume:
      ${resumeText}
    `;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const role =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim();

    return allowedRoles.includes(role) ? role : "Uncategorized";
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Uncategorized";
  }
};

exports.categorizeResume = async (req, res) => {
  try {
    // const { userName } = req.user;

    // if (!userName) {
    //   return res.status(400).json({ error: "Username is required" });
    // }

    // const user = await User.findOne({ userName });

    // if (!user || !user.resume) {
    //   return res.status(404).json({ error: "User or resume not found" });
    // }
    // const resumePath = path.join(__dirname, "../uploads", user.resume);

    const resumePath = path.join(__dirname, "../uploads", "resume.pdf"); // for testing
    const pythonScript = path.join(__dirname, "../ResumeParser.py");
    const pythonCommand =
      os.platform() === "win32" ? "python" : "venv/bin/python3";

    exec(
      `${pythonCommand} "${pythonScript}" "${resumePath}"`,
      async (err, stdout, stderr) => {
        if (err) {
          console.error("Python script error:", stderr);
          return res
            .status(500)
            .json({ error: `Error executing Python script: ${stderr}` });
        }

        const extractedText = stdout.trim();
        if (!extractedText) {
          return res
            .status(500)
            .json({ error: "Failed to extract resume text" });
        }

        const prompt = `Analyze the following resume and suggest the most suitable role from: Software Engineer, Data Scientist, ML Engineer, DevOps Engineer. Resume:\n${extractedText}`;

        const roleCategory = await getRoleFromGemini(prompt);

        res.json({
          message: "Resume uploaded successfully",
          role: roleCategory,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.generateQuestions = async (req, res) => {
  try {
    const { role, difficulty, count } = req.body;

    if (!role || !difficulty || !count) {
      return res
        .status(400)
        .json({ error: "Role, difficulty, and count are required" });
    }

    const prompt = `
      Generate ${count} interview questions for a ${role} at ${difficulty} level.
      Format the response as a **valid JSON array** with only questions.
      Example:
      [
        "What is the difference between HTTP and HTTPS?",
        "Explain the concept of closures in JavaScript.",
        "What are ACID properties in databases?"
      ]
      Do **not** include any Markdown formatting like \`\`\`json.
      Respond **only** with the JSON array.
    `;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    console.log("Raw API Response:", response.data);

    let responseText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    responseText = responseText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let questions = [];
    try {
      questions = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid response format from AI" });
    }

    res.json({ questions });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question || !answer)
      return res
        .status(400)
        .json({ error: "Question and answer are required" });

    const prompt = `Evaluate the following answer to the given question. Give scores out of 10 for technical accuracy and communication clarity.
        \nQuestion: ${question}
        \nAnswer: ${answer}
        \nProvide output in JSON format as { "technical_score": number, "communication_score": number }.`;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    const scores = JSON.parse(
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}"
    );
    res.json({ scores });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
