import React, { useState, useRef, useCallback } from 'react';

const PullToRefresh = ({ onRefresh, children }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);

  const threshold = 80;

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current?.scrollTop === 0) {
      startY.current = e.touches[0].clientY;
      setPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!pulling || refreshing) return;
    const diff = e.touches[0].clientY - startY.current;
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, 120));
    }
  }, [pulling, refreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(50);
      try {
        await onRefresh();
      } catch (e) {}
      setRefreshing(false);
    }
    setPullDistance(0);
    setPulling(false);
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className="pull-to-refresh-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`pull-indicator ${refreshing ? 'refreshing' : ''} ${pullDistance >= threshold ? 'ready' : ''}`}
        style={{ height: pullDistance > 0 || refreshing ? `${refreshing ? 50 : pullDistance}px` : '0px' }}
      >
        <div className="pull-spinner">
          <div className="spinner-ring"></div>
        </div>
        <span className="pull-text">
          {refreshing ? 'Refreshing...' : pullDistance >= threshold ? 'Release to refresh' : 'Pull down to refresh'}
        </span>
      </div>
      {children}
    </div>
  );
};

export default PullToRefresh;
