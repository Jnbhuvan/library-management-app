const { Schema, model } = require('mongoose');
module.exports = model('Member', new Schema({
  name: { type: String, required: [true, 'Name is required.'], trim: true },
  email: { type: String, required: [true, 'Email is required.'], unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  active: { type: Boolean, default: true }
}, { timestamps: true }));
