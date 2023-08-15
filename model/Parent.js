const mongoose = require("mongoose");
 
const { Schema } = mongoose;

const ParentSchema = new Schema({
  parentphno: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  kidrollno: [{
    type: Schema.Types.String,
    ref: 'Student',
    lowercase: true,
  }],
});

module.exports = mongoose.model("parent", ParentSchema);
