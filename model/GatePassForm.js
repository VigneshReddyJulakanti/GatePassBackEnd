const mongoose = require("mongoose");

const { Schema } = mongoose;

const GatePassFormSchema = new Schema({
  rollno: {
    type: String,
    required: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  class: {
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
  },
  reason: {
    type: String,
    required: true,
  },
  dateTime: {
    type: Date,
    required: true,
  },
  teacher_accepted: {
    type: Boolean,
    default: false,
  },
  teacher_rejected: {
    type: Boolean,
    default: false,
  },
  parent_accepted: {
    type: Boolean,
    default: false,
  },
  parent_rejected: {
    type: Boolean,
    default: false,
  },
  admin_accepted: {
    type: Boolean,
    default: false,
  },
  admin_rejected: {
    type: Boolean,
    default: false,
  },
  teacher_message: {
    type: String,
  },
  parent_message: {
    type: String,
  },
  admin_message: {
    type: String,
  },
});

module.exports = mongoose.model("gatepassform", GatePassFormSchema);
