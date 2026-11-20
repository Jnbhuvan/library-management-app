const router = require('express').Router();
const Member = require('../models/Member');
const Loan = require('../models/Loan');
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;
    const filter = q ? { $or: [{ name: new RegExp(esc(q), 'i') }, { email: new RegExp(esc(q), 'i') }] } : {};
    const members = await Member.find(filter).sort({ name: 1 }).lean();
    const counts = await Loan.aggregate([{ $match: { returnedAt: null } }, { $group: { _id: '$member', n: { $sum: 1 } } }]);
    const map = Object.fromEntries(counts.map(c => [String(c._id), c.n]));
    res.json(members.map(m => ({ ...m, activeLoans: map[String(m._id)] || 0 })));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try { res.status(201).json(await Member.create(req.body)); } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const m = await Member.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!m) return res.status(404).json({ error: 'Member not found.' });
    res.json(m);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (await Loan.exists({ member: req.params.id, returnedAt: null }))
      return res.status(409).json({ error: 'This member has books on loan and can\'t be deleted.' });
    const r = await Member.findByIdAndDelete(req.params.id);
    if (!r) return res.status(404).json({ error: 'Member not found.' });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

module.exports = router;
