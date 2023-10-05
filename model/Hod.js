const mongoose = require("mongoose");

const hodSchema = new mongoose.Schema({
  empid: {
    type: String,
    unique: true, // Ensures that each employee ID is unique
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true, // Ensures that each email is unique
    required: true,
    lowercase: true, // Ensures emails are stored in lowercase
  },
  password: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
    lowercase: true
  },
});

const HOD = mongoose.model("HOD", hodSchema);

module.exports = HOD;
