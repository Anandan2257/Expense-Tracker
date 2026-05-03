const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');
const mongoose = require('mongoose');

// All routes require auth
router.use(auth);

// GET all transactions (with optional filters)
router.get('/', async (req, res) => {
  try {
    const { type, category, startDate, endDate, month, year } = req.query;
    const filter = { user: req.userId };

    if (type) filter.type = type;
    if (category) filter.category = category;

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      filter.date = { $gte: start, $lte: end };
    }

    const transactions = await Transaction.find(filter)
      .populate('category')
      .sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET summary
router.get('/summary', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const uid = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { user: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    const income = result.find((r) => r._id === 'income')?.total || 0;
    const expense = result.find((r) => r._id === 'expense')?.total || 0;

    res.json({ income, expense, balance: income - expense, month: m, year: y });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET category-wise breakdown
router.get('/by-category', async (req, res) => {
  try {
    const { month, year, type } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const uid = new mongoose.Types.ObjectId(req.userId);

    const match = { user: uid, date: { $gte: start, $lte: end } };
    if (type) match.type = type;

    const result = await Transaction.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET daily trend
router.get('/daily', async (req, res) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const uid = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { user: uid, date: { $gte: start, $lte: end } } },
      { $group: { _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, type: '$type' }, total: { $sum: '$amount' } } },
      { $sort: { '_id.date': 1 } },
    ]);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET overall account stats (all-time)
router.get('/account-stats', async (req, res) => {
  try {
    const uid = new mongoose.Types.ObjectId(req.userId);

    const result = await Transaction.aggregate([
      { $match: { user: uid } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    const income = result.find((r) => r._id === 'income') || { total: 0, count: 0 };
    const expense = result.find((r) => r._id === 'expense') || { total: 0, count: 0 };
    const totalTx = income.count + expense.count;

    const first = await Transaction.findOne({ user: req.userId }).sort({ date: 1 }).select('date');
    const last = await Transaction.findOne({ user: req.userId }).sort({ date: -1 }).select('date');

    const months = await Transaction.aggregate([
      { $match: { user: uid } },
      { $group: { _id: { m: { $month: '$date' }, y: { $year: '$date' } } } },
    ]);

    res.json({
      totalIncome: income.total,
      totalExpense: expense.total,
      balance: income.total - expense.total,
      totalTransactions: totalTx,
      incomeCount: income.count,
      expenseCount: expense.count,
      firstDate: first?.date || null,
      lastDate: last?.date || null,
      activeMonths: months.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create transaction
router.post('/', async (req, res) => {
  try {
    const transaction = await Transaction.create({ ...req.body, user: req.userId });
    const populated = await transaction.populate('category');
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update transaction
router.put('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    ).populate('category');
    if (!transaction) return res.status(404).json({ error: 'Not found' });
    res.json(transaction);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE transaction
router.delete('/:id', async (req, res) => {
  try {
    await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
