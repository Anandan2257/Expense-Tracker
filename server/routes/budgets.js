const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// All routes require auth
router.use(auth);

// GET budgets for a month
router.get('/', async (req, res) => {
  try {
    const m = parseInt(req.query.month) || new Date().getMonth() + 1;
    const y = parseInt(req.query.year) || new Date().getFullYear();

    const budgets = await Budget.find({ user: req.userId, month: m, year: y }).populate('category');

    // Get actual spending per category for this user
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const uid = new mongoose.Types.ObjectId(req.userId);

    const spending = await Transaction.aggregate([
      { $match: { user: uid, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const result = budgets.map((b) => {
      const s = spending.find((sp) => sp._id.toString() === b.category._id.toString());
      return {
        ...b.toObject(),
        spent: s ? s.spent : 0,
        remaining: b.amount - (s ? s.spent : 0),
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create/update budget
router.post('/', async (req, res) => {
  try {
    const { category, amount, month, year } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.userId, category, month, year },
      { amount },
      { upsert: true, new: true, runValidators: true }
    ).populate('category');
    res.status(201).json(budget);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE budget
router.delete('/:id', async (req, res) => {
  try {
    await Budget.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Budget deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
