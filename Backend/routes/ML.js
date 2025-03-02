const express = require("express");
const { categorizeResume } = require("../controllers/ML");
const router = express.Router();

router.get("/categorize", categorizeResume);

module.exports = router;
