const mongoose = require("mongoose");
 
const { Schema } = mongoose;

const WatchManSchema = new Schema({
  phno: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  }
});

module.exports = mongoose.model("watchman", WatchManSchema);
