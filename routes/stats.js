const router = require('express').Router();
const Book = require('../models/Book');
const Member = require('../models/Member');
const Loan = require('../models/Loan');

router.get('/', async (req, res, next) => {
  try {
    const [titles, members, active, overdue, copies, topBooks] = await Promise.all([
      Book.countDocuments(), Member.countDocuments(),
      Loan.countDocuments({ returnedAt: null }),
      Loan.countDocuments({ returnedAt: null, dueDate: { $lt: new Date() } }),
      Book.aggregate([{ $group: { _id: null, total: { $sum: '$totalCopies' }, available: { $sum: '$availableCopies' } } }]),
      Loan.aggregate([
        { $group: { _id: '$book', loans: { $sum: 1 } } }, { $sort: { loans: -1 } }, { $limit: 5 },
        { $lookup: { from: 'books', localField: '_id', foreignField: '_id', as: 'b' } }, { $unwind: '$b' },
        { $project: { title: '$b.title', author: '$b.author', loans: 1 } }
      ])
    ]);
    res.json({ titles, members, active, overdue, totalCopies: copies[0]?.total || 0, availableCopies: copies[0]?.available || 0, topBooks });
  } catch (e) { next(e); }
});

module.exports = router;
