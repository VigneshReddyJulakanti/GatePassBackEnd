const mongoose = require("mongoose");

const { Schema } = mongoose;

const ClassSchema = new Schema({
  department: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

const StudentSchema = new Schema({
  rollno: {
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
  class: [ClassSchema],
  email: {
    type: String,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  parentno: {
    parentphno1: {
      type: String,
      lowercase: true,
    },
    parentphno2: {
      type: String,
      lowercase: true,
    },
  },
});

module.exports = mongoose.model("student", StudentSchema);
