const express = require("express");
const isAuth = require("../middlewares/isAuth");
const { categorizeResume, generateInterview, evaluateAnswers } = require("../controllers/genAi");

const router = express.Router();

router.get("/categorize",isAuth,categorizeResume);
router.post("/genInterview",isAuth,generateInterview);
router.post("/evaluate", isAuth,evaluateAnswers);

module.exports = router;
