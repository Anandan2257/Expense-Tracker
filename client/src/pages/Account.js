import React, { useState, useEffect } from 'react';
import { getAccountStats, getCategories, deleteCategory, seedCategories } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const Account = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    fetchStats();
    getCategories().then(res => setCategories(res.data)).catch(() => {});
  }, []);

  const fetchStats = async () => {
    try {
      const res = await getAccountStats();
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateShort = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handleResetCategories = async () => {
    try {
      for (const cat of categories) {
        await deleteCategory(cat._id).catch(() => {});
      }
      await seedCategories();
      const res = await getCategories();
      setCategories(res.data);
      setConfirmReset(false);
    } catch (err) {
      console.error(err);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <>
    <div className="page">
      <div className="header">
        <h1>Account</h1>
        <div className="date-label">Your financial overview</div>
      </div>

      {/* Profile Card */}
      <div className="account-profile-card">
        <div className="account-avatar">{user?.name?.charAt(0)?.toUpperCase() || '💰'}</div>
        <div className="account-info">
          <div className="account-name">{user?.name || 'My Wallet'}</div>
          <div className="account-subtitle">{user?.email}</div>
          {stats?.firstDate && (
            <div className="account-subtitle">Tracking since {formatDateShort(stats.firstDate)}</div>
          )}
        </div>
      </div>

      {/* Balance Overview */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="label">Total Income</div>
          <div className="amount income">{formatCurrency(stats?.totalIncome || 0)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Total Expense</div>
          <div className="amount expense">{formatCurrency(stats?.totalExpense || 0)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Net Balance</div>
          <div className="amount balance">{formatCurrency(stats?.balance || 0)}</div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section-title">Activity</div>
      <div className="account-stats-grid">
        <div className="account-stat-card">
          <div className="account-stat-icon">📊</div>
          <div className="account-stat-value">{stats?.totalTransactions || 0}</div>
          <div className="account-stat-label">Transactions</div>
        </div>
        <div className="account-stat-card">
          <div className="account-stat-icon">📈</div>
          <div className="account-stat-value">{stats?.incomeCount || 0}</div>
          <div className="account-stat-label">Income</div>
        </div>
        <div className="account-stat-card">
          <div className="account-stat-icon">📉</div>
          <div className="account-stat-value">{stats?.expenseCount || 0}</div>
          <div className="account-stat-label">Expense</div>
        </div>
        <div className="account-stat-card">
          <div className="account-stat-icon">📅</div>
          <div className="account-stat-value">{stats?.activeMonths || 0}</div>
          <div className="account-stat-label">Months</div>
        </div>
      </div>

      {/* Average Spending */}
      {stats && stats.activeMonths > 0 && (
        <>
          <div className="section-title">Monthly Average</div>
          <div className="account-avg-section">
            <div className="account-avg-item">
              <span className="account-avg-label">Avg. Income</span>
              <span className="account-avg-value income">
                {formatCurrency(Math.round(stats.totalIncome / stats.activeMonths))}
              </span>
            </div>
            <div className="account-avg-item">
              <span className="account-avg-label">Avg. Expense</span>
              <span className="account-avg-value expense">
                {formatCurrency(Math.round(stats.totalExpense / stats.activeMonths))}
              </span>
            </div>
            <div className="account-avg-item">
              <span className="account-avg-label">Avg. Savings</span>
              <span className="account-avg-value balance">
                {formatCurrency(Math.round(stats.balance / stats.activeMonths))}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Categories Section */}
      <div className="section-title" onClick={() => setShowCategories(!showCategories)} style={{ cursor: 'pointer' }}>
        Categories {showCategories ? '▾' : '▸'}
      </div>
      {showCategories && (
        <div className="account-categories">
          {incomeCategories.length > 0 && (
            <>
              <div className="account-cat-type">Income</div>
              <div className="account-cat-list">
                {incomeCategories.map(c => (
                  <div key={c._id} className="account-cat-item">
                    <span className="account-cat-icon" style={{ background: c.color + '30' }}>{c.icon}</span>
                    <span className="account-cat-name">{c.name}</span>
                    <span className="account-cat-color" style={{ background: c.color }} />
                  </div>
                ))}
              </div>
            </>
          )}
          {expenseCategories.length > 0 && (
            <>
              <div className="account-cat-type">Expense</div>
              <div className="account-cat-list">
                {expenseCategories.map(c => (
                  <div key={c._id} className="account-cat-item">
                    <span className="account-cat-icon" style={{ background: c.color + '30' }}>{c.icon}</span>
                    <span className="account-cat-name">{c.name}</span>
                    <span className="account-cat-color" style={{ background: c.color }} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Section */}
      <div className="section-title">Settings</div>
      <div className="account-settings">
        <div className="account-setting-item" onClick={() => setConfirmReset(true)}>
          <span className="account-setting-icon">🔄</span>
          <div className="account-setting-info">
            <div className="account-setting-name">Reset Categories</div>
            <div className="account-setting-desc">Restore default categories with updated colors</div>
          </div>
          <span className="account-setting-arrow">›</span>
        </div>
        <div className="account-setting-item">
          <span className="account-setting-icon">💱</span>
          <div className="account-setting-info">
            <div className="account-setting-name">Currency</div>
            <div className="account-setting-desc">Indian Rupee (₹)</div>
          </div>
        </div>
        <div className="account-setting-item">
          <span className="account-setting-icon">📱</span>
          <div className="account-setting-info">
            <div className="account-setting-name">App Version</div>
            <div className="account-setting-desc">1.0.0</div>
          </div>
        </div>
        <div className="account-setting-item logout" onClick={() => setConfirmLogout(true)}>
          <span className="account-setting-icon">🚪</span>
          <div className="account-setting-info">
            <div className="account-setting-name" style={{ color: 'var(--red)' }}>Logout</div>
            <div className="account-setting-desc">Sign out of your account</div>
          </div>
          <span className="account-setting-arrow">›</span>
        </div>
      </div>

    </div>

    <ConfirmDialog
      isOpen={confirmReset}
      title="Reset Categories"
      message="This will delete all existing categories and restore defaults. Existing transactions will keep their categories. Continue?"
      onConfirm={handleResetCategories}
      onCancel={() => setConfirmReset(false)}
      confirmText="Reset"
    />
    <ConfirmDialog
      isOpen={confirmLogout}
      title="Logout"
      message="Are you sure you want to sign out?"
      onConfirm={logout}
      onCancel={() => setConfirmLogout(false)}
      confirmText="Logout"
    />
    </>
  );
};

export default Account;
