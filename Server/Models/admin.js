const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  id: String,
  userName: String,
  email: String,
  password: String
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
