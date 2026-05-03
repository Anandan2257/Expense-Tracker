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
  const [yearView, setYearView] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(year / 12) * 12);

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
    setYearView(false);
    setYearRangeStart(Math.floor(year / 12) * 12);
    setPickerOpen(true);
  };

  const selectMonth = (m) => {
    onChange(m, pickerYear);
    setPickerOpen(false);
  };

  const selectYear = (y) => {
    setPickerYear(y);
    setYearView(false);
  };

  const openYearView = () => {
    setYearRangeStart(Math.floor(pickerYear / 12) * 12);
    setYearView(true);
  };

  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

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
            {yearView ? (
              <>
                <div className="month-picker-year">
                  <button onClick={() => setYearRangeStart(yearRangeStart - 12)}><FiChevronLeft /></button>
                  <span>{yearRangeStart} – {yearRangeStart + 11}</span>
                  <button onClick={() => setYearRangeStart(yearRangeStart + 12)}><FiChevronRight /></button>
                </div>
                <div className="month-picker-grid">
                  {years.map((y) => (
                    <button
                      key={y}
                      className={`month-picker-item ${y === pickerYear ? 'active' : ''}`}
                      onClick={() => selectYear(y)}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="month-picker-year">
                  <button onClick={() => setPickerYear(pickerYear - 1)}><FiChevronLeft /></button>
                  <span className="year-label" onClick={openYearView}>{pickerYear}</span>
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
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MonthSelector;
