const express = require("express");
const { parseResume } = require("../controllers/resume");
const multer = require("multer");

const upload = multer({ dest: "uploads/"});

const router = express.Router();

router.post("/parse", upload.single("resume"), parseResume);

module.exports = router;
