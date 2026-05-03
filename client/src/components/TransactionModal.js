import React, { useState, useEffect } from 'react';
import { getCategories, createTransaction, updateTransaction, deleteTransaction } from '../utils/api';
import { PAYMENT_METHODS } from '../utils/helpers';
import ConfirmDialog from './ConfirmDialog';
import DatePicker from './DatePicker';

const TransactionModal = ({ isOpen, onClose, onSave, editData }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [categories, setCategories] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editData) {
      setType(editData.type);
      setAmount(String(editData.amount));
      setCategoryId(editData.category?._id || editData.category);
      setNote(editData.note || '');
      setDate(new Date(editData.date).toISOString().split('T')[0]);
      setPaymentMethod(editData.paymentMethod || 'cash');
    } else {
      setType('expense');
      setAmount('');
      setCategoryId('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('cash');
    }
  }, [editData, isOpen]);

  useEffect(() => {
    if (isOpen) {
      getCategories(type).then((res) => setCategories(res.data));
    }
  }, [type, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const data = {
      type,
      amount: parseFloat(amount),
      category: categoryId,
      note,
      date,
      paymentMethod,
    };

    try {
      if (editData) {
        await updateTransaction(editData._id, data);
      } else {
        await createTransaction(data);
      }
      onSave();
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || 'Error saving transaction');
    }
  };

  const handleDelete = async () => {
    if (!editData) return;
    await deleteTransaction(editData._id);
    setShowDeleteConfirm(false);
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editData ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="type-toggle">
            <button
              type="button"
              className={type === 'income' ? 'active-income' : ''}
              onClick={() => setType('income')}
            >
              Income
            </button>
            <button
              type="button"
              className={type === 'expense' ? 'active-expense' : ''}
              onClick={() => setType('expense')}
            >
              Expense
            </button>
          </div>

          <div className="form-group">
            <label>Amount</label>
            <div className="amount-input-wrapper">
              <span className="amount-prefix">₹</span>
              <input
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="1"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label>Category</label>
            <div className="category-grid">
              {categories.map((cat) => (
                <div
                  key={cat._id}
                  className={`category-chip ${categoryId === cat._id ? 'selected' : ''}`}
                  onClick={() => setCategoryId(cat._id)}
                >
                  <span className="icon">{cat.icon}</span>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Date</label>
            <DatePicker value={date} onChange={(val) => setDate(val)} />
          </div>

          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-method-grid">
              {PAYMENT_METHODS.map((pm) => (
                <div
                  key={pm.value}
                  className={`payment-chip ${paymentMethod === pm.value ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod(pm.value)}
                >
                  <span className="pm-icon">{pm.icon}</span>
                  <span>{pm.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Note (optional)</label>
            <input
              type="text"
              placeholder="Add a note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="submit-btn">
            {editData ? 'Update' : 'Save'}
          </button>

          {editData && (
            <button type="button" className="delete-btn" onClick={() => setShowDeleteConfirm(true)}>
              Delete Transaction
            </button>
          )}
        </form>

        <ConfirmDialog
          isOpen={showDeleteConfirm}
          title="Delete Transaction"
          message="This action cannot be undone. Are you sure?"
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      </div>
    </div>
  );
};

export default TransactionModal;
