const { Schema, model } = require('mongoose');
const bookSchema = new Schema({
  title: { type: String, required: [true, 'Title is required.'], trim: true },
  author: { type: String, required: [true, 'Author is required.'], trim: true },
  isbn: { type: String, required: [true, 'ISBN is required.'], unique: true, trim: true },
  genre: { type: String, trim: true, default: 'General' },
  year: { type: Number, min: 0, max: 3000 },
  totalCopies: { type: Number, required: true, min: [1, 'At least 1 copy is required.'], default: 1 },
  availableCopies: { type: Number, min: 0 }
}, { timestamps: true });
bookSchema.pre('validate', function (next) {
  if (this.isNew && this.availableCopies == null) this.availableCopies = this.totalCopies;
  next();
});
module.exports = model('Book', bookSchema);
