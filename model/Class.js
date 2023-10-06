const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  department: {
    type: String,
    required: true,
    lowercase: true,
  },
  section: {
    type: String,
    required: true,
    lowercase: true,
  },
  year: {
    type: Number,
    required: true,
  },
});

// Create a unique index on the combination of department, section, and year
classSchema.index({ department: 1, section: 1, year: 1 }, { unique: true });

const Class = mongoose.model("Class", classSchema);

module.exports = Class;
