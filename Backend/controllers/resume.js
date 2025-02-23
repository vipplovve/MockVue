const fs = require("fs");
const os = require("os");
const { exec } = require("child_process");
const path = require("path");

const parseResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  const { originalname, path: tempPath, filename } = req.file;
  const ext = path.extname(originalname) || ".pdf";
  const newPath = path.join(__dirname, "../uploads", `${filename}${ext}`);

  fs.renameSync(tempPath, newPath);

  console.log(`File saved as: ${newPath}`);

  const pythonScript = path.join(__dirname, "../ResumeParser.py");
  const pythonCommand = os.platform() === "win32" ? "python" : "python3"; 

  exec(`${pythonCommand} "${pythonScript}" "${newPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error("Python script error:", stderr);
      return res.status(500).send(`Error executing Python script: ${stderr}`);
    }
    console.log("Extracted Text:\n", stdout);
    console.log("Python script finished. sending response...");
    // send parsed text to classification model
    res.send({ text: "uploaded Sucessfully" });
  });
};

module.exports = { parseResume };
