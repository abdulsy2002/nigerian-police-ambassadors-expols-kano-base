const mongoose = require('mongoose');

const expolsSchema = new mongoose.Schema({
  fullName: String, otherName: String, gender: String, dob: Date,
  nin: String, phone: String, email: String, address: String,
  school: String, admissionNo: String, yearAdmission: Number, yearGraduation: Number,
  houseHostel: String, positionHeld: String, qualification: String,
  occupation: String, state: String, alumniChapter: String,
  passport: String, ssceCert: String,
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExpolsRegistration', expolsSchema);