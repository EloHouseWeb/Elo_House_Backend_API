const mongoose = require("mongoose");

//structure of document
const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
