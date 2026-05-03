import React, { useEffect, useState } from 'react';

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', danger = true }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={`confirm-overlay ${visible ? 'confirm-visible' : ''}`} onClick={onCancel}>
      <div className={`confirm-dialog ${visible ? 'confirm-dialog-visible' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">{danger ? '⚠️' : 'ℹ️'}</div>
        <h3 className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancel</button>
          <button
            className={`confirm-ok ${danger ? 'confirm-danger' : 'confirm-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
