const router = require('express').Router();
const Book = require('../models/Book');
const Loan = require('../models/Loan');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res, next) => {
  try {
    const { q, genre } = req.query;
    const filter = {};
    if (q) { const r = new RegExp(esc(q), 'i'); filter.$or = [{ title: r }, { author: r }, { isbn: r }]; }
    if (genre) filter.genre = genre;
    res.json(await Book.find(filter).sort({ title: 1 }));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Book.create(req.body)); } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found.' });
    const issued = book.totalCopies - book.availableCopies;
    const { totalCopies, availableCopies, ...rest } = req.body;
    Object.assign(book, rest);
    if (totalCopies != null) {
      if (totalCopies < issued) return res.status(400).json({ error: `${issued} copies are currently issued; total can't be lower.` });
      book.totalCopies = totalCopies;
      book.availableCopies = totalCopies - issued;
    }
    res.json(await book.save());
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (await Loan.exists({ book: req.params.id, returnedAt: null }))
      return res.status(409).json({ error: 'This book has active loans and can\'t be deleted.' });
    const r = await Book.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Book not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
