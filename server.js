require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/books', require('./routes/books'));
app.use('/api/members', require('./routes/members'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/stats', require('./routes/stats'));

// Central error handler: turns Mongo/Mongoose errors into readable messages
app.use((err, req, res, next) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    return res.status(409).json({ error: `A record with this ${field} already exists.` });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(' ') });
  }
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid ID.' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Something went wrong.' });
});

const { MONGODB_URI, MONGODB_DB = 'library', PORT = 3000 } = process.env;
if (!MONGODB_URI) { console.error('MONGODB_URI is missing. Check your .env file.'); process.exit(1); }

mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB })
  .then(() => {
    console.log(`Connected to MongoDB (db: ${MONGODB_DB})`);
    app.listen(PORT, () => console.log(`Library app running at http://localhost:${PORT}`));
  })
  .catch(err => { console.error('MongoDB connection failed:', err.message); process.exit(1); });
