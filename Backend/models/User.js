const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: false,
  },
  parsedResume: {
    type: String,
    required: false,
  },
});

module.exports = mongoose.model("Users", userSchema);
