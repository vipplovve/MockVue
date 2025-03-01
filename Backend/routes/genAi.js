const express = require("express");
const isAuth = require("../middlewares/isAuth");
const { categorizeResume, generateInterview } = require("../controllers/genAi");

const router = express.Router();

router.get("/categorize",categorizeResume);
router.post("/genInterview",generateInterview);

module.exports = router;
