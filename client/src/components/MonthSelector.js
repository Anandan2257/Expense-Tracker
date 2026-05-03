import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getMonthName } from '../utils/helpers';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MonthSelector = ({ month, year, onChange }) => {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);

  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  const openPicker = () => {
    setPickerYear(year);
    setPickerOpen(true);
  };

  const selectMonth = (m) => {
    onChange(m, pickerYear);
    setPickerOpen(false);
  };

  return (
    <>
      <div className="month-selector">
        <button onClick={prev}><FiChevronLeft /></button>
        <span className="month-label" onClick={openPicker}>{getMonthName(month)} {year}</span>
        <button onClick={next}><FiChevronRight /></button>
      </div>

      {pickerOpen && (
        <div className="month-picker-overlay" onClick={() => setPickerOpen(false)}>
          <div className="month-picker" onClick={(e) => e.stopPropagation()}>
            <div className="month-picker-year">
              <button onClick={() => setPickerYear(pickerYear - 1)}><FiChevronLeft /></button>
              <span>{pickerYear}</span>
              <button onClick={() => setPickerYear(pickerYear + 1)}><FiChevronRight /></button>
            </div>
            <div className="month-picker-grid">
              {MONTHS.map((m, i) => (
                <button
                  key={m}
                  className={`month-picker-item ${i + 1 === month && pickerYear === year ? 'active' : ''}`}
                  onClick={() => selectMonth(i + 1)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthSelector;
