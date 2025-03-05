const express = require("express");
const { categorizeResume } = require("../controllers/ML");
const isAuth = require("../middlewares/isAuth");
const router = express.Router();

router.get("/categorize",isAuth, categorizeResume);

module.exports = router;
