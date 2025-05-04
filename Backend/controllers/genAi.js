const axios = require("axios");
const User = require("../models/User");
const Interview = require("../models/Interview");

const API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

exports.genResumeAnalysis = async (req, res) => {
  const userName = req.user.userName;
  const user = await User.findOne({
    userName,
  });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!user.parsedResume) {
    return res.status(404).json({ error: "Resume not found" });
  }
  const resumeText = user.parsedResume;
  const role = req.body.role || "Software Engineer";
  const level = req.body.level || "fresher";
  try {
    const prompt = `
      You are a professional resume reviewer and hiring expert. Review the following resume for the role of "${role}" as a "${level}" and score it out of 100. Return a detailed JSON response structured as follows:

      1. Score breakdown by category with:
         - "score" (numeric)
         - "summary" (short evaluation)
         - "comments" (array of specific suggestions)
      2. A "total_score" (out of 100)
      3. An "overall_comment" summarizing resume quality

      Scoring Criteria (Total 100 Points):
      - Education (10)
      - Work Experience (25)
      - Projects (15)
      - Skills (15)
      - Measurable Metrics (10)
      - Formatting & Structure (10)
      - Keywords & ATS Optimization (10)
      - Contact Information Completeness (5)

      Respond ONLY with a valid JSON object in the following format:

      {
        "total_score": 88,
        "breakdown": {
          "education": {
            "score": 9,
            "summary": "Excellent academic record with a high CGPA.",
            "comments": [
              "Consider adding relevant coursework within your field of interest, if applicable.",
              "Mention any significant academic projects or research undertaken during your degree.",
              "No suggestions."
            ]
          },
          "work_experience": {
            "score": 23,
            "summary": "Strong internship experience with quantifiable achievements.",
            "comments": [
              "Focus on using strong action verbs to describe your contributions (e.g., 'Implemented', 'Developed').",
              "Quantify your contributions whenever possible. You've done a good job already, try to add more.",
              "Use the STAR method (Situation, Task, Action, Result) to elaborate on your responsibilities and accomplishments in the internship."
            ]
          },
          "projects": {
            "score": 14,
            "summary": "Well-described projects demonstrating practical skills.",
            "comments": [
              "Ensure the project descriptions clearly highlight your role and contributions to each project.",
              "Include more details about the challenges you faced and how you overcame them.",
              "Quantify the impact of your project work, where possible."
            ]
          },
          "skills": {
            "score": 14,
            "summary": "Comprehensive skill set relevant to software engineering.",
            "comments": [
              "Categorize skills by proficiency level (e.g., proficient, familiar) to provide a clearer picture of your expertise.",
              "List skills in order of relevance to the targeted software engineer roles.",
              "No suggestions."
            ]
          },
          "measurable_metrics": {
            "score": 9,
            "summary": "Good use of metrics to showcase impact.",
            "comments": [
              "Continue to quantify the impact of your work wherever possible.",
              "Ensure that the metrics are clearly linked to your actions and results.",
              "Expand on the context behind the metrics to highlight the significance of the results."
            ]
          },
          "formatting_structure": {
            "score": 10,
            "summary": "Well-organized and easy-to-read format.",
            "comments": [
              "Maintain consistent formatting throughout the resume.",
              "Use white space effectively to improve readability.",
              "No suggestions."
            ]
          },
          "keywords_ats_optimization": {
            "score": 5,
            "summary": "ATS optimization needs improvement.",
            "comments": [
              "Tailor your resume to the specific keywords listed in the job descriptions you are applying for.",
              "Use common industry terms and abbreviations to increase ATS compatibility.",
              "Ensure that keywords are naturally integrated into the content of your resume."
            ]
          },
          "contact_information": {
            "score": 4,
            "summary": "Sufficient contact information.",
            "comments": [
              "Ensure all links are active and point to the correct page.",
              "Consider adding city/state to the address.",
              "No suggestions."
            ]
          }
        },
        "overall_comment": "Excellent resume for a fresher. Strong academic background, relevant experience, and impactful projects. Focus on optimizing for ATS and integrating relevant keywords to maximize visibility to recruiters."
      }
        
      Resume:
      ${resumeText}
    `;

    const response = await axios.post(GEMINI_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    let responseText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    responseText = responseText.replace(/```json|```/g, "").trim();

    let resumeScore = {};
    try {
      resumeScore = JSON.parse(responseText);
    } catch (err) {
      console.error(
        "Error parsing Gemini resume score response:",
        responseText,
        err
      );
      return res.status(500).json({
        error: "Failed to parse resume score response",
      });
    }

    return res.status(200).json(resumeScore);
  } catch (error) {
    console.error("Gemini API error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

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

    let responseText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    responseText = responseText.replace(/```json|```/g, "").trim();

    let skillsAndObjective = {};
    try {
      skillsAndObjective = JSON.parse(responseText);
    } catch (err) {
      console.error("Error parsing Gemini response:", responseText, err);
      return { career_objective: "", skills: "" };
    }

    return skillsAndObjective;
  } catch (error) {
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

    const generalQuestionsCount = Math.ceil(count / 3);
    const skillBasedQuestionsCount = Math.ceil(count / 3);
    const codeBasedQuestionsCount = Math.ceil(count / 3);
    const prompt = `
      Generate ${generalQuestionsCount} general technical verbally answerable interview questions for a ${role} at ${difficulty} level.
      Then generate ${skillBasedQuestionsCount} technical verbally answerable questions based on one of these skills: ${skillsArray.join(
      ", "
    )}.
      Then generate ${codeBasedQuestionsCount} coding questions that can be written with pseudocode in under 2 mins.
      Format the response as a **valid JSON Array** with questions and their types (Oral/Code).
      Example:
      [
      {
        "question": "What is the difference between HTTP and HTTPS?",
        "type": "Oral"
      },
      {
        "question": "Explain the difference between a stack and a queue.",
        "type": "Oral"
      },
      {
        "question": "Explain the concept of containerization using Docker.",
        "type": "Oral"
      },
      {
        "question": "What is the purpose of a load balancer?",
        "type": "Oral"
      },
      {
        "question": "Write a pseudocode for a function that reverses a string.",
        "type": "Code"
      },
      {
        "question": "Write a pseudocode for a function that checks if a number is prime.",
        "type": "Code"
      }
      ]
      Keep in mind that oral questions are for interview and will be directly converted to speech using tts, so they should be short and to the point.
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
      questions = questions.slice(0, count);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return res.status(500).json({ error: "Invalid response format from AI" });
    }

    const interview = await Interview.create({
      userName,
      role,
      difficulty,
      questions: questions,
    });
    const interviewId = interview._id;
    res.json({ interviewId, message: "Questions generated successfully" });
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

    console.log("Evaluation started...");

    await Promise.all(
      questions.map(async ({ question, answer , type }) => {
        

          const prompt =
            type == "Oral"
              ? `Evaluate the following answer to the given question. Give scores out of 10 for technical accuracy and communication clarity.
          \nQuestion: ${question}
          \nAnswer: ${answer}
          \nProvide output in JSON format as { "technical_score": number, "communication_score": number }.
          Do **not** include any Markdown formatting like \`\`\`json.
          Respond **only** with the JSON Object.
          `
              : `Evaluate the given pseudocode answer to the given question. Give scores out of 10 for technical accuracy and code clarity (as communication_score in json).
           \nQuestion: ${question}
          \nAnswer: ${answer}
          \nProvide output in JSON format as { "technical_score": number, "communication_score": number }.
          Do **not** include any Markdown formatting like \`\`\`json.
          Respond **only** with the JSON Object.
          `;

        try {
          const response = await axios.post(GEMINI_URL, {
            contents: [{ parts: [{ text: prompt }] }],
          });

          let jsonText =
            response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          jsonText = jsonText.replace(/```json|```/g, "").trim();
          if (jsonText) {
            try {
              const parsedData = JSON.parse(jsonText); 

              if (
                parsedData.technical_score !== undefined &&
                parsedData.communication_score !== undefined
              ) {
                totalTechnicalScore += parsedData.technical_score;
                totalCommunicationScore += parsedData.communication_score;
                validResponses++;
              }
            } catch (parseError) {
              console.error("JSON Parsing Error:", parseError);
            }
          }
        } catch (apiError) {
          console.error("Error calling Gemini API:", apiError);
        }
      })
    );

    console.log("Evaluation completed.");

    const avgTechnicalScore =
      validResponses > 0 ? totalTechnicalScore / validResponses : 0;
    const avgCommunicationScore =
      validResponses > 0 ? totalCommunicationScore / validResponses : 0;

    console.log({
      tech: avgTechnicalScore.toFixed(2),
      comm: avgCommunicationScore.toFixed(2),
    });

    res.json({
      tech: avgTechnicalScore.toFixed(2),
      comm: avgCommunicationScore.toFixed(2),
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
