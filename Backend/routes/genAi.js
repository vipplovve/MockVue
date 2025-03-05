const express = require("express");
const isAuth = require("../middlewares/isAuth");
const { categorizeResume, generateInterview, evaluateAnswers } = require("../controllers/genAi");

const router = express.Router();

router.get("/categorize",categorizeResume);
router.post("/genInterview",generateInterview);
router.get("/evaluate", evaluateAnswers);

module.exports = router;
