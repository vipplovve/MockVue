const { spawn } = require("child_process");
const User = require("../models/User");
const { getSkillsandObjective } = require("./genAi");

exports.categorizeResume = async (req, res) => {
    const userName = req.user.userName;
    // const userName = "Sunpreet";
    const user = await User.findOne({
        userName
    });
    const resumeText = user.parsedResume;
    const inputData = await getSkillsandObjective(resumeText);
    console.log(inputData)

    // const inputData = {
    //     career_objective: req.body.career_objective,
    //     skills: req.body.skills
    // };

    const pythonProcess = spawn("python", ["../ML/scripts/run_models.py"]); // Suppress error logs

    pythonProcess.stdin.write(JSON.stringify(inputData));
    pythonProcess.stdin.end();

    let resultData = "";

    pythonProcess.stdout.on("data", (data) => {
        console.log("logs:", data.toString());
        resultData = data.toString();
    });
    pythonProcess.stderr.on("data", (data) => {
        console.error("Error:", data.toString());
    });

    pythonProcess.on("close", () => {
        try {
            const parsedData = JSON.parse(resultData.trim());
            res.json(parsedData);
        } catch (error) {
            console.error("Error parsing prediction output:", error.message);
        }
    });
};
