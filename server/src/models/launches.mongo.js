const mongoose = require('mongoose');

const launchSchema = new mongoose.Schema({
  flightNumber: {
    type: Number,
    required: true,
  },
  launchDate: {
    type: Date,
    required: true,
  },
  mission: {
    type: String,
    required: true,
  },
  rocket: {
    type: String,
    required: true,
  },
  target: {
    type: String,
  },
  upcoming: {
    type: Boolean,
    required: true,
  },
  customers: [String],
  success: {
    type: Boolean,
    required: true,
    default: true,
  },
});

module.exports = mongoose.model('Launch', launchSchema);
