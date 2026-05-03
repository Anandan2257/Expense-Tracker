import React, { useState, useEffect, useCallback } from 'react';
import { getTransactions, deleteTransaction } from '../utils/api';
import { formatCurrency, formatDate, getPaymentIcon } from '../utils/helpers';
import MonthSelector from '../components/MonthSelector';
import TransactionModal from '../components/TransactionModal';
import SwipeableItem from '../components/SwipeableItem';
import ConfirmDialog from '../components/ConfirmDialog';
import PullToRefresh from '../components/PullToRefresh';
import LoadingScreen from '../components/LoadingScreen';

const Transactions = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleSwipeDelete = async () => {
    if (confirmDelete) {
      await deleteTransaction(confirmDelete._id);
      setConfirmDelete(null);
      fetchData();
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const params = { month, year };
      if (filter !== 'all') params.type = filter;
      const res = await getTransactions(params);
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group transactions by date
  const grouped = transactions.reduce((acc, tx) => {
    const dateKey = formatDate(tx.date);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  if (loading) return <div className="page"><LoadingScreen /></div>;

  return (
    <>
    <PullToRefresh onRefresh={fetchData}>
    <div className="page">
      <div className="header">
        <h1>Transaction History</h1>
      </div>

      <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      <div className="type-toggle" style={{ padding: '0 16px', marginBottom: 8 }}>
        <button
          className={filter === 'all' ? 'active-all' : ''}
          onClick={() => setFilter('all')}
        >All</button>
        <button
          className={filter === 'income' ? 'active-income' : ''}
          onClick={() => setFilter('income')}
        >Income</button>
        <button
          className={filter === 'expense' ? 'active-expense' : ''}
          onClick={() => setFilter('expense')}
        >Expense</button>
      </div>

      <div className="transaction-list">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No transactions found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, txs]) => {
            const dayIncome = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
            const dayExpense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
            return (
            <div key={date}>
              <div className="date-group-header">
                <span>{date}</span>
                <span className="date-group-totals">
                  {dayIncome > 0 && <span className="income">+{formatCurrency(dayIncome)}</span>}
                  {dayExpense > 0 && <span className="expense">-{formatCurrency(dayExpense)}</span>}
                </span>
              </div>
              {txs.map((tx) => (
                <SwipeableItem
                  key={tx._id}
                  onDelete={() => setConfirmDelete(tx)}
                  onEdit={() => { setEditTx(tx); setModalOpen(true); }}
                  onTap={() => { setEditTx(tx); setModalOpen(true); }}
                >
                  <div className="transaction-item">
                    <div
                      className="transaction-icon"
                      style={{ background: tx.category?.color + '30' }}
                    >
                      {tx.category?.icon || '📁'}
                    </div>
                    <div className="transaction-details">
                      <div className="cat-name">{tx.category?.name}</div>
                      <div className="tx-meta">
                        <span className="tx-payment">{getPaymentIcon(tx.paymentMethod)} {tx.paymentMethod?.replace('_', ' ')}</span>
                      </div>
                      {tx.note && <div className="note">{tx.note}</div>}
                    </div>
                    <div className={`transaction-amount ${tx.type}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                </SwipeableItem>
              ))}
            </div>
            );
          })
        )}
      </div>
    </div>
    </PullToRefresh>

    <button className="fab-button" onClick={() => { setEditTx(null); setModalOpen(true); }}>
      +
    </button>

    <TransactionModal
      isOpen={modalOpen}
      onClose={() => { setModalOpen(false); setEditTx(null); }}
      onSave={fetchData}
      editData={editTx}
    />

    <ConfirmDialog
      isOpen={!!confirmDelete}
      title="Delete Transaction"
      message={`Delete ${confirmDelete?.category?.name || 'this'} — ${formatCurrency(confirmDelete?.amount || 0)}?`}
      onConfirm={handleSwipeDelete}
      onCancel={() => setConfirmDelete(null)}
    />
    </>
  );
};

export default Transactions;
