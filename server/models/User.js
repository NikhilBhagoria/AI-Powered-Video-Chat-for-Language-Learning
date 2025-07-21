const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // For demo only, use hash in prod
  nativeLanguage: String,
  learningLanguage: String,
});

module.exports = mongoose.model("User", userSchema);