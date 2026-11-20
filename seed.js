// Optional: npm run seed  (adds sample books and members)
require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const Member = require('./models/Member');

const books = [
  ['The God of Small Things', 'Arundhati Roy', '9780006550686', 'Fiction', 1997, 3],
  ['Midnight\'s Children', 'Salman Rushdie', '9780812976533', 'Fiction', 1981, 2],
  ['A Brief History of Time', 'Stephen Hawking', '9780553380163', 'Science', 1988, 4],
  ['Wings of Fire', 'A. P. J. Abdul Kalam', '9788173711466', 'Biography', 1999, 5],
  ['The Discovery of India', 'Jawaharlal Nehru', '9780143031031', 'History', 1946, 2],
  ['Clean Code', 'Robert C. Martin', '9780132350884', 'Technology', 2008, 3]
];
(async () => {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || 'library' });
  for (const [title, author, isbn, genre, year, totalCopies] of books)
    await Book.updateOne({ isbn }, { $setOnInsert: { title, author, isbn, genre, year, totalCopies, availableCopies: totalCopies } }, { upsert: true });
  for (const [name, email] of [['Asha Rao', 'asha@example.com'], ['Vikram Nair', 'vikram@example.com']])
    await Member.updateOne({ email }, { $setOnInsert: { name, email } }, { upsert: true });
  console.log('Seeded sample data.');
  await mongoose.disconnect();
})();
