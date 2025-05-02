const express = require("express");
const isAuth = require("../middlewares/isAuth");
const { categorizeResume, generateInterview, evaluateAnswers, genResumeAnalysis } = require("../controllers/genAi");

const router = express.Router();

router.get("/categorize",isAuth,categorizeResume);
router.post("/genInterview",isAuth,generateInterview);
router.post("/evaluate", isAuth,evaluateAnswers);
router.post("/genResumeAnalysis", isAuth, genResumeAnalysis);
module.exports = router;
