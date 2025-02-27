const express = require("express");
const isAuth = require("../middlewares/isAuth");
const { categorizeResume, generateQuestions } = require("../controllers/genAi");

const router = express.Router();

router.get("/categorize",categorizeResume);
router.post("/genQues",generateQuestions);

module.exports = router;
