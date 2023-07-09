const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  username: String,
  password: String,
  profilePic: String
});

const userModel = new mongoose.model("user", userSchema);

module.exports = userModel;



