const router = require('express').Router();
const Loan = require('../models/Loan');
const Book = require('../models/Book');
const Member = require('../models/Member');

const LOAN_DAYS = +process.env.LOAN_DAYS || 14;
const FINE_PER_DAY = +process.env.FINE_PER_DAY || 5;
const MAX_ACTIVE = 5;
const DAY = 86400000;

router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query; // active | overdue | returned
    const filter = {};
    if (status === 'active') filter.returnedAt = null;
    if (status === 'overdue') { filter.returnedAt = null; filter.dueDate = { $lt: new Date() }; }
    if (status === 'returned') filter.returnedAt = { $ne: null };
    const loans = await Loan.find(filter).sort({ issuedAt: -1 }).populate('book', 'title author').populate('member', 'name email').lean();
    const now = Date.now();
    res.json(loans.map(l => {
      const overdueDays = !l.returnedAt && l.dueDate < now ? Math.ceil((now - l.dueDate) / DAY) : 0;
      return { ...l, overdue: overdueDays > 0, pendingFine: overdueDays * FINE_PER_DAY };
    }));
  } catch (e) { next(e); }
});

// Issue a book
router.post('/', async (req, res, next) => {
  try {
    const { bookId, memberId, days } = req.body;
    const member = await Member.findById(memberId);
    if (!member || !member.active) return res.status(400).json({ error: 'Member not found or inactive.' });
    if (await Loan.exists({ book: bookId, member: memberId, returnedAt: null }))
      return res.status(409).json({ error: 'This member already has this book.' });
    if (await Loan.countDocuments({ member: memberId, returnedAt: null }) >= MAX_ACTIVE)
      return res.status(409).json({ error: `Members can borrow up to ${MAX_ACTIVE} books at a time.` });

    // Atomic decrement prevents issuing the last copy twice
    const book = await Book.findOneAndUpdate({ _id: bookId, availableCopies: { $gt: 0 } }, { $inc: { availableCopies: -1 } }, { new: true });
    if (!book) return res.status(409).json({ error: 'No copies available for this book.' });

    try {
      const loan = await Loan.create({ book: bookId, member: memberId, dueDate: new Date(Date.now() + (+days || LOAN_DAYS) * DAY) });
      res.status(201).json(loan);
    } catch (e) { await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: 1 } }); throw e; }
  } catch (e) { next(e); }
});

// Return a book
router.post('/:id/return', async (req, res, next) => {
  try {
    const loan = await Loan.findOneAndUpdate({ _id: req.params.id, returnedAt: null }, { returnedAt: new Date() }, { new: true });
    if (!loan) return res.status(404).json({ error: 'Active loan not found.' });
    const late = Math.max(0, Math.ceil((loan.returnedAt - loan.dueDate) / DAY));
    loan.fine = late * FINE_PER_DAY;
    await loan.save();
    await Book.findByIdAndUpdate(loan.book, { $inc: { availableCopies: 1 } });
    res.json(loan);
  } catch (e) { next(e); }
});

module.exports = router;
