const mongoose = require("mongoose");

const { Schema } = mongoose;

const AdminSchema = new Schema({
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
});

module.exports = mongoose.model("administration", AdminSchema);
