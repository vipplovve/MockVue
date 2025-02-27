const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");
const User = require("../models/User");

const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { originalname, path: tempPath, filename } = req.file;
  const ext = path.extname(originalname) || ".pdf";
  const newPath = path.join(__dirname, "../uploads", `${filename}${ext}`);

  fs.renameSync(tempPath, newPath);

  const pythonScript = path.join(__dirname, "../ResumeParser.py");
  const pythonCommand =
    os.platform() === "win32" ? "python" : "venv/bin/python3";

  exec(
    `${pythonCommand} "${pythonScript}" "${newPath}"`,
    async (err, stdout, stderr) => {
      if (err) {
        console.error("Python script error:", stderr);
        return res.status(500).send(`Error executing Python script: ${stderr}`);
      }

      const extractedText = stdout.trim();
      if (!extractedText) {
        return res.status(500).send("Failed to extract resume text");
      }

      await User.findOneAndUpdate(
        { userName: req.user.userName },
        { resume: originalname, parsedResume: extractedText }
      );
      res.send({ text: "uploaded Sucessfully" });
    }
  );
};

module.exports = { parseResume };
