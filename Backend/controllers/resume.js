const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");

const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const pdfPath = path.join(__dirname, "../uploads", req.file.filename);
  const pythonScript = path.join(__dirname, "ResumeParser.py");

  const pythonCommand = os.platform() === "win32" ? "python" : "python3"; 

  exec(`${pythonCommand} ${pythonScript} ${pdfPath}`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).send(`Error executing Python script: ${stderr}`);
    }
    console.log(stdout);
    res.send({ text: stdout });
  });
};

module.exports = { parseResume };
