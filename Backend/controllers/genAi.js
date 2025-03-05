const axios = require("axios");
const User = require("../models/User");
const Interview = require("../models/Interview");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

exports.getSkillsandObjective = async (resumeText) => {
  try {
    const prompt = `
      Extract key technical skills and predict the general career objective of the candidate from the following resume text:
      Resume: ${resumeText}
      Respond only with a **comma-separated string** of skills (e.g., JavaScript, React, Node.js) and the career objective.
      Format the response as a **valid JSON object** with only skills and career objective.
      Example:
      {
        "career_objective": "I love data science and analytics",
        "skills": "Python, SQL, Machine Learning"
      }
    `;
    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    responseText = responseText.replace(/```json|```/g, "").trim();

    let skillsAndObjective = {};
    try {
      skillsAndObjective = JSON.parse(responseText);
    } catch (err) {
      console.error("Error parsing Gemini response:", responseText, err);
      return { career_objective: "", skills: "" };
    }

    return skillsAndObjective;
  }
  catch (error) {
    console.error("Gemini API error:", error);
    return { career_objective: "", skills: "" };
  }
};

const getRolesFromGemini = async (resumeText) => {
  try {
    const allowedRoles = [
      "Software Engineer",
      "ML Engineer",
      "BackEnd Developer",
      "Data Scientist",
      "Hardware Engineer",
      "FrontEnd Developer",
      "DevOps Engineer",
    ];

    const prompt = `
      Based on the following resume, determine the **two** most relevant job roles.
      Choose only from the following options: ${allowedRoles.join(", ")}.
      Respond **ONLY** in JSON array format (no explanations, no text, just JSON): 

      ["Role1", "Role2"]
      
      Resume:
      ${resumeText}
    `;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let rolesText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text.trim();

    rolesText = rolesText.replace(/```json|```/g, "").trim();

    let roles = [];
    try {
      roles = JSON.parse(rolesText);
    } catch (err) {
      console.error("Error parsing Gemini response:", rolesText, err);
      return ["Uncategorized"];
    }

    // ✅ Ensure valid roles
    roles = roles.filter((role) => allowedRoles.includes(role));

    return roles.length > 0 ? roles : ["Uncategorized"];
  } catch (error) {
    console.error("Gemini API error:", error);
    return ["Uncategorized"];
  }
};



exports.categorizeResume = async (req, res) => {
  try {
    const userName = "Sunpreet";

    if (!userName) {
      return res.status(400).json({ error: "Username is required" });
    }

    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resumeText = user.parsedResume;
    const roleCategories = await getRolesFromGemini(resumeText);
    console.log(roleCategories);

    res.json({
      roles: roleCategories,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.generateInterview = async (req, res) => {
  try {
    const { role, difficulty, count } = req.body;
    console.log(role, difficulty, count);
    const userName = req.user.userName;
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resumeText = user.parsedResume;

    if (!role || !difficulty || !count) {
      return res.status(400).json({ error: "Params missing" });
    }

    const skillExtractionPrompt = `
      Extract key technical skills from the following resume text:
      Resume: ${resumeText}
      Respond only with a **comma-separated list** of skills (e.g., JavaScript, React, Node.js).
    `;

    const skillResponse = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: skillExtractionPrompt }] }],
    });

    let extractedSkills =
      skillResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    extractedSkills = extractedSkills
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const skillsArray = extractedSkills.split(",").map((skill) => skill.trim());

    const generalQuestionsCount = Math.ceil(count / 2);
    const skillBasedQuestionsCount = count - generalQuestionsCount;

    const prompt = `
      Generate ${generalQuestionsCount} general technical interview questions for a ${role} at ${difficulty} level.
      Then generate ${skillBasedQuestionsCount} technical questions based on these skills: ${skillsArray.join(
      ", "
    )}.
      Questions Should be short and to the point and verbally anwserable.
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

    const interview = await Interview.create({
      userName,
      role,
      difficulty,
      questions: questions.map((q) => ({
        question: q,
        answer: "",
      })),
    });
    const interviewId = interview._id;
    res.json({interviewId,message: "Questions generated successfully" });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.evaluateAnswers = async (req, res) => {
  try {
    const { interviewId } = req.body;

    const interview = await Interview.findById(interviewId);
    if (
      !interview ||
      !interview.questions ||
      interview.questions.length === 0
    ) {
      return res
        .status(404)
        .json({ error: "Interview not found or no questions available" });
    }

    const { questions } = interview;
    let totalTechnicalScore = 0;
    let totalCommunicationScore = 0;
    let validResponses = 0;

    await Promise.all(
      questions.map(async ({ question, answer }) => {
        const prompt = `Evaluate the following answer to the given question. Give scores out of 10 for technical accuracy and communication clarity.
          \nQuestion: ${question}
          \nAnswer: ${answer}
          \nProvide output in JSON format as { "technical_score": number, "communication_score": number }.`;

        try {
          const response = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }],
          });

          const data = response.data;

          if (
            data &&
            data.technical_score !== undefined &&
            data.communication_score !== undefined
          ) {
            totalTechnicalScore += data.technical_score;
            totalCommunicationScore += data.communication_score;
            validResponses++;
          }
        } catch (apiError) {
          console.error("Error calling Gemini API:", apiError);
        }
      })
    );

    const avgTechnicalScore =
      validResponses > 0 ? totalTechnicalScore / validResponses : 0;
    const avgCommunicationScore =
      validResponses > 0 ? totalCommunicationScore / validResponses : 0;

    res.json({
      avg_technical_score: avgTechnicalScore.toFixed(2),
      avg_communication_score: avgCommunicationScore.toFixed(2),
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
