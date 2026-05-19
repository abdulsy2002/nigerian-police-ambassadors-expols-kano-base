const mongoose = require('mongoose');

const ambassadorSchema = new mongoose.Schema({
  fullName: String, gender: String, dob: Date, phone: String,
  email: String, address: String, state: String,
  occupation: String, organization: String, position: String,
  yearsExperience: Number, linkedin: String,
  ambassadorType: String, supportType: String, commitment: String,
  whyAmbassador: String, message: String,
  supportingDoc: String, passport: String,
  registeredAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AmbassadorRegistration', ambassadorSchema);