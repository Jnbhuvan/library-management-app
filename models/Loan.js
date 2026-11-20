const { Schema, model } = require('mongoose');
module.exports = model('Loan', new Schema({
  book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
  member: { type: Schema.Types.ObjectId, ref: 'Member', required: true },
  issuedAt: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnedAt: { type: Date, default: null },
  fine: { type: Number, default: 0 }
}, { timestamps: true }));
