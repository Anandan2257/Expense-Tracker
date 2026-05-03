import React, { useState, useEffect, useCallback } from 'react';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { getByCategory, getDailyTrend, getSummary } from '../utils/api';
import { formatCurrency } from '../utils/helpers';
import MonthSelector from '../components/MonthSelector';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

ChartJS.defaults.color = '#cdb87c';
ChartJS.defaults.borderColor = 'rgba(224, 184, 48, 0.1)';

const Stats = () => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [breakdown, setBreakdown] = useState([]);
  const [daily, setDaily] = useState([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0 });
  const [viewType, setViewType] = useState('expense');

  const fetchData = useCallback(async () => {
    try {
      const [catRes, dailyRes, sumRes] = await Promise.all([
        getByCategory({ month, year, type: viewType }),
        getDailyTrend({ month, year }),
        getSummary({ month, year }),
      ]);
      setBreakdown(catRes.data);
      setDaily(dailyRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error(err);
    }
  }, [month, year, viewType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalForType = breakdown.reduce((s, b) => s + b.total, 0);

  const doughnutData = {
    labels: breakdown.map((b) => b.category.name),
    datasets: [
      {
        data: breakdown.map((b) => b.total),
        backgroundColor: breakdown.map((b) => b.category.color),
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  // Build daily line chart
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const incomeByDay = {};
  const expenseByDay = {};
  daily.forEach((d) => {
    const day = parseInt(d._id.date.split('-')[2]);
    if (d._id.type === 'income') incomeByDay[day] = d.total;
    else expenseByDay[day] = d.total;
  });

  const lineData = {
    labels: dayLabels,
    datasets: [
      {
        label: 'Income',
        data: dayLabels.map((d) => incomeByDay[d] || 0),
        borderColor: '#3bebb0',
        backgroundColor: 'rgba(59, 235, 176, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Expense',
        data: dayLabels.map((d) => expenseByDay[d] || 0),
        borderColor: '#ff5252',
        backgroundColor: 'rgba(255, 82, 82, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="page">
      <div className="header">
        <h1>Statistics</h1>
      </div>

      <MonthSelector month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      {/* Income vs Expense summary */}
      <div className="summary-cards" style={{ marginTop: 0, marginBottom: 16 }}>
        <div className="summary-card">
          <div className="label">Income</div>
          <div className="amount income">{formatCurrency(summary.income)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Expense</div>
          <div className="amount expense">{formatCurrency(summary.expense)}</div>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="chart-container">
        <h3>Daily Trend</h3>
        <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
      </div>

      {/* Category Breakdown */}
      <div className="type-toggle" style={{ padding: '0 16px', margin: '8px 0' }}>
        <button
          className={viewType === 'expense' ? 'active-expense' : ''}
          onClick={() => setViewType('expense')}
        >Expense</button>
        <button
          className={viewType === 'income' ? 'active-income' : ''}
          onClick={() => setViewType('income')}
        >Income</button>
      </div>

      {breakdown.length > 0 && (
        <div className="chart-container">
          <h3>By Category</h3>
          <div style={{ maxWidth: 250, margin: '0 auto' }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                cutout: '65%',
                plugins: {
                  legend: { display: false },
                },
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, fontWeight: 700, fontSize: 20, color: '#e0b830' }}>
            {formatCurrency(totalForType)}
          </div>
        </div>
      )}

      <div className="category-breakdown">
        {breakdown.map((b) => (
          <div key={b._id} className="breakdown-item">
            <span className="icon">{b.category.icon}</span>
            <div className="info">
              <div className="name">{b.category.name}</div>
              <div className="bar">
                <div
                  className="bar-fill"
                  style={{
                    width: `${totalForType ? (b.total / totalForType) * 100 : 0}%`,
                    background: b.category.color,
                  }}
                />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="amount">{formatCurrency(b.total)}</div>
              <div className="count">{b.count} txns</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stats;
