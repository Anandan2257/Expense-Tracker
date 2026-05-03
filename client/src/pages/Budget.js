import React, { useState, useEffect, useCallback } from 'react';
import { getBudgets, createBudget, deleteBudget, getCategories } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import MonthSelector from '../components/MonthSelector';
import SwipeableItem from '../components/SwipeableItem';
import ConfirmDialog from '../components/ConfirmDialog';

const Budget = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState(null);
  const [formCat, setFormCat] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [budgetRes, catRes] = await Promise.all([
        getBudgets({ month, year }),
        getCategories('expense'),
      ]);
      setBudgets(budgetRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openAdd = () => {
    setEditBudget(null);
    setFormCat('');
    setFormAmount('');
    setShowForm(true);
  };

  const openEdit = (b) => {
    setEditBudget(b);
    setFormCat(b.category?._id || '');
    setFormAmount(String(b.amount));
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formCat || !formAmount) return;
    await createBudget({ category: formCat, amount: parseFloat(formAmount), month, year });
    setFormCat('');
    setFormAmount('');
    setEditBudget(null);
    setShowForm(false);
    fetchData();
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      await deleteBudget(confirmDelete._id);
      setConfirmDelete(null);
      fetchData();
    }
  };

  // Filter out categories that already have a budget (except the one being edited)
  const budgetedCatIds = budgets.map(b => b.category?._id);
  const availableCategories = categories.filter(
    c => !budgetedCatIds.includes(c._id) || (editBudget && editBudget.category?._id === c._id)
  );

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);

  return (
    <>
    <div className="page">
      <div className="header">
        <h1>Budget</h1>
        <div className="date-label">Set spending limits per category</div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="label">Budget</div>
          <div className="amount balance">{formatCurrency(totalBudget)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Spent</div>
          <div className="amount expense">{formatCurrency(totalSpent)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Left</div>
          <div className="amount income">{formatCurrency(totalBudget - totalSpent)}</div>
        </div>
      </div>

      <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      {budgets.length === 0 && !showForm ? (
        <div className="empty-state">
          <div className="icon">🎯</div>
          <p>No budgets set for this month</p>
        </div>
      ) : (
        <div className="transaction-list">
          {budgets.map((b) => {
            const pct = b.amount ? (b.spent / b.amount) * 100 : 0;
            const barClass = pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'safe';
            return (
              <SwipeableItem
                key={b._id}
                onDelete={() => setConfirmDelete(b)}
                onEdit={() => openEdit(b)}
                onTap={() => openEdit(b)}
              >
                <div className="transaction-item">
                  <div
                    className="transaction-icon"
                    style={{ background: (b.category?.color || '#cdb87c') + '30' }}
                  >
                    {b.category?.icon || '🎯'}
                  </div>
                  <div className="transaction-details">
                    <div className="cat-name">{b.category?.name}</div>
                    <div className="tx-meta">
                      <span className="tx-payment">{formatCurrency(b.spent)} spent</span>
                      <span className="tx-dot">·</span>
                      <span style={{ color: pct >= 100 ? '#ff5252' : pct >= 80 ? 'var(--yellow)' : 'var(--green)', fontWeight: 600 }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="budget-bar" style={{ marginTop: 6 }}>
                      <div
                        className={`budget-bar-fill ${barClass}`}
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="transaction-amount" style={{ color: 'var(--accent)' }}>
                    {formatCurrency(b.amount)}
                  </div>
                </div>
              </SwipeableItem>
            );
          })}
        </div>
      )}
    </div>

    {showForm && (
      <div className="modal-overlay" onClick={() => { setShowForm(false); setEditBudget(null); }}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>{editBudget ? 'Edit Budget' : 'Add Budget'}</h2>
            <button className="modal-close" onClick={() => { setShowForm(false); setEditBudget(null); }}>&times;</button>
          </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category</label>
                <div className="category-grid">
                  {availableCategories.map((c) => (
                    <div
                      key={c._id}
                      className={`category-chip ${formCat === c._id ? 'selected' : ''}`}
                      onClick={() => setFormCat(c._id)}
                    >
                      <span className="icon">{c.icon}</span>
                      <span>{c.name}</span>
                    </div>
                  ))}
                  {availableCategories.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 12 }}>
                      All categories have budgets set
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Budget Amount</label>
                <div className="amount-input-wrapper">
                  <span className="amount-prefix">₹</span>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="submit-btn">
                {editBudget ? 'Update Budget' : 'Set Budget'}
              </button>
              {editBudget && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => { setShowForm(false); setConfirmDelete(editBudget); setEditBudget(null); }}
                >
                  Delete Budget
                </button>
              )}
            </form>
          </div>
        </div>
      )}

    <button
      className="fab-button"
      onClick={openAdd}
    >
      +
    </button>

    <ConfirmDialog
      isOpen={!!confirmDelete}
      title="Remove Budget"
      message={`Remove budget for ${confirmDelete?.category?.name || 'this category'}?`}
      onConfirm={handleDelete}
      onCancel={() => setConfirmDelete(null)}
      confirmText="Remove"
    />
    </>
  );
};

export default Budget;
