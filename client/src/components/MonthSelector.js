import React from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getMonthName } from '../utils/helpers';

const MonthSelector = ({ month, year, onChange }) => {
  const prev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const next = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <div className="month-selector">
      <button onClick={prev}><FiChevronLeft /></button>
      <span>{getMonthName(month)} {year}</span>
      <button onClick={next}><FiChevronRight /></button>
    </div>
  );
};

export default MonthSelector;
