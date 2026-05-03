import React, { useState, useRef, useEffect } from 'react';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DatePicker = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value + 'T00:00:00') : new Date();
  const [viewMonth, setViewMonth] = useState(selected.getMonth());
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const ref = useRef();

  useEffect(() => {
    if (open) {
      const d = value ? new Date(value + 'T00:00:00') : new Date();
      setViewMonth(d.getMonth());
      setViewYear(d.getFullYear());
    }
  }, [open, value]);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const selectDay = (day) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange(`${viewYear}-${m}-${d}`);
    setOpen(false);
  };

  const isToday = (day) => {
    const now = new Date();
    return day === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();
  };

  const isSelected = (day) => {
    return day === selected.getDate() && viewMonth === selected.getMonth() && viewYear === selected.getFullYear();
  };

  const displayDate = value
    ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Select date';

  const cells = [];
  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, type: 'prev' });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    cells.push({ day: i, type: 'current' });
  }
  // Next month leading days — fill to nearest complete row (35 or 42)
  const totalNeeded = cells.length <= 35 ? 35 : 42;
  const remaining = totalNeeded - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push({ day: i, type: 'next' });
  }

  return (
    <div className="dp-wrapper" ref={ref}>
      <div className="dp-input" onClick={() => setOpen(!open)}>
        <span className="dp-icon">📅</span>
        <span className="dp-value">{displayDate}</span>
        <span className="dp-arrow">{open ? '▲' : '▼'}</span>
      </div>

      {open && (
        <div className="dp-dropdown">
          <div className="dp-header">
            <button type="button" className="dp-nav" onClick={prevMonth}>‹</button>
            <span className="dp-month-year">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" className="dp-nav" onClick={nextMonth}>›</button>
          </div>

          <div className="dp-weekdays">
            {DAYS.map((d) => <div key={d} className="dp-weekday">{d}</div>)}
          </div>

          <div className="dp-grid">
            {cells.map((cell, i) => (
              <button
                key={i}
                type="button"
                className={`dp-day ${cell.type !== 'current' ? 'dp-day-dim' : ''} ${cell.type === 'current' && isToday(cell.day) ? 'dp-today' : ''} ${cell.type === 'current' && isSelected(cell.day) ? 'dp-selected' : ''}`}
                onClick={() => cell.type === 'current' && selectDay(cell.day)}
                disabled={cell.type !== 'current'}
              >
                {cell.day}
              </button>
            ))}
          </div>

          <div className="dp-footer">
            <button type="button" className="dp-today-btn" onClick={() => {
              const now = new Date();
              const m = String(now.getMonth() + 1).padStart(2, '0');
              const d = String(now.getDate()).padStart(2, '0');
              onChange(`${now.getFullYear()}-${m}-${d}`);
              setOpen(false);
            }}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
