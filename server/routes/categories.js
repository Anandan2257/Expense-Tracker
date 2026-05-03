const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { auth } = require('../middleware/auth');

// All routes require auth
router.use(auth);

// GET all categories for this user
router.get('/', async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.type) filter.type = req.query.type;
    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create category
router.post('/', async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, user: req.userId });
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE category
router.delete('/:id', async (req, res) => {
  try {
    await Category.findOneAndDelete({ _id: req.params.id, user: req.userId });
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed default categories for this user
router.post('/seed', async (req, res) => {
  try {
    const count = await Category.countDocuments({ user: req.userId });
    if (count > 0) return res.json({ message: 'Categories already seeded' });

    const defaults = [
      { name: 'Salary', type: 'income', icon: '💰', color: '#2ecc71' },
      { name: 'Freelance', type: 'income', icon: '💻', color: '#1abc9c' },
      { name: 'Investment', type: 'income', icon: '📈', color: '#9b59b6' },
      { name: 'Other Income', type: 'income', icon: '🎁', color: '#00d2d3' },
      { name: 'Food', type: 'expense', icon: '🍔', color: '#ff9f43' },
      { name: 'Transport', type: 'expense', icon: '🚗', color: '#54a0ff' },
      { name: 'Shopping', type: 'expense', icon: '🛒', color: '#ff6b81' },
      { name: 'Bills', type: 'expense', icon: '📄', color: '#ff4757' },
      { name: 'Entertainment', type: 'expense', icon: '🎬', color: '#a55eea' },
      { name: 'Health', type: 'expense', icon: '🏥', color: '#2ecc71' },
      { name: 'Education', type: 'expense', icon: '📚', color: '#45aaf2' },
      { name: 'Rent', type: 'expense', icon: '🏠', color: '#cd853f' },
      { name: 'Groceries', type: 'expense', icon: '🥦', color: '#26de81' },
      { name: 'Family', type: 'expense', icon: '👨‍👩‍👧', color: '#fdcb6e' },
      { name: 'Other', type: 'expense', icon: '📦', color: '#a4b0be' },
    ];

    const withUser = defaults.map(d => ({ ...d, user: req.userId }));
    await Category.insertMany(withUser);
    res.status(201).json({ message: 'Default categories seeded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
