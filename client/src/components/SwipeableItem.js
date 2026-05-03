import React, { useRef, useState } from 'react';

const SwipeableItem = ({ children, onDelete, onEdit, onTap }) => {
  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);
  const [offset, setOffset] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const didSwipe = useRef(false);
  const threshold = 80;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = startX.current;
    setSwiping(true);
    didSwipe.current = false;
  };

  const handleTouchMove = (e) => {
    if (!swiping) return;
    currentX.current = e.touches[0].clientX;
    const diffX = currentX.current - startX.current;
    const diffY = e.touches[0].clientY - startY.current;

    // If scrolling vertically, don't swipe
    if (Math.abs(diffY) > Math.abs(diffX) && !didSwipe.current) return;

    if (Math.abs(diffX) > 5) didSwipe.current = true;

    if (diffX < 0) {
      setOffset(Math.max(diffX, -160));
    } else if (diffX > 0) {
      setOffset(Math.min(diffX, 100));
    }
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (offset < -threshold) {
      setOffset(-140);
    } else if (offset > threshold && onEdit) {
      onEdit();
      setOffset(0);
    } else {
      setOffset(0);
    }
  };

  const resetSwipe = () => setOffset(0);

  const handleClick = () => {
    if (Math.abs(offset) > 10) {
      resetSwipe();
    } else if (!didSwipe.current && onTap) {
      onTap();
    }
  };

  return (
    <div className="swipeable-container">
      <div className="swipe-actions-right">
        <button
          className="swipe-action-btn swipe-edit"
          onClick={(e) => { e.stopPropagation(); resetSwipe(); onEdit && onEdit(); }}
        >
          <span>✏️</span>
          <span>Edit</span>
        </button>
        <button
          className="swipe-action-btn swipe-delete"
          onClick={(e) => { e.stopPropagation(); resetSwipe(); onDelete(); }}
        >
          <span>🗑</span>
          <span>Delete</span>
        </button>
      </div>
      {offset > 20 && (
        <div className="swipe-actions-left">
          <div className="swipe-hint-edit">
            <span>✏️ Edit</span>
          </div>
        </div>
      )}
      <div
        className="swipeable-content"
        style={{
          transform: `translateX(${offset}px)`,
          transition: swiping ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {children}
      </div>
    </div>
  );
};

export default SwipeableItem;
