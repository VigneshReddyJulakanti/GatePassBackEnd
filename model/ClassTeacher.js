const mongoose = require("mongoose");

const { Schema } = mongoose;

const ClassSchema = new Schema({
  section: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

const TeacherSchema = new Schema({
  employeeid: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  class: [ClassSchema],
});

module.exports = mongoose.model("teacher", TeacherSchema);
