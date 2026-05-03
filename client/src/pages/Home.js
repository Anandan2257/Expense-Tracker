import React, { useState, useEffect, useCallback } from 'react';
import { getSummary, getTransactions, deleteTransaction } from '../utils/api';
import { formatCurrency, formatDate, getPaymentIcon } from '../utils/helpers';
import MonthSelector from '../components/MonthSelector';
import TransactionModal from '../components/TransactionModal';
import SwipeableItem from '../components/SwipeableItem';
import ConfirmDialog from '../components/ConfirmDialog';
import PullToRefresh from '../components/PullToRefresh';
import LoadingScreen from '../components/LoadingScreen';

const Home = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [recent, setRecent] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTx, setEditTx] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        getSummary({ month, year }),
        getTransactions({ month, year }),
      ]);
      setSummary(sumRes.data);
      setRecent(txRes.data.slice(0, 10));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleMonthChange = (m, y) => { setMonth(m); setYear(y); };

  const handleSwipeDelete = async () => {
    if (confirmDelete) {
      await deleteTransaction(confirmDelete._id);
      setConfirmDelete(null);
      fetchData();
    }
  };

  if (loading) return <div className="page"><LoadingScreen /></div>;

  return (
    <>
    <PullToRefresh onRefresh={fetchData}>
    <div className="page">
      <div className="header">
        <h1>Expense Tracker</h1>
        <div className="date-label">Track your money like a pro</div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <div className="label">Income</div>
          <div className="amount income">{formatCurrency(summary.income)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Expense</div>
          <div className="amount expense">{formatCurrency(summary.expense)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Balance</div>
          <div className="amount balance">{formatCurrency(summary.balance)}</div>
        </div>
      </div>

      <MonthSelector month={month} year={year} onChange={handleMonthChange} />

      <div className="section-title">Recent Transactions</div>
      <div className="transaction-list">
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            <p>No transactions this month</p>
          </div>
        ) : (
          recent.map((tx) => (
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
                    <span className="tx-date">{formatDate(tx.date)}</span>
                    <span className="tx-dot">·</span>
                    <span className="tx-payment">{getPaymentIcon(tx.paymentMethod)} {tx.paymentMethod?.replace('_', ' ')}</span>
                  </div>
                  {tx.note && <div className="note">{tx.note}</div>}
                </div>
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            </SwipeableItem>
          ))
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

export default Home;
