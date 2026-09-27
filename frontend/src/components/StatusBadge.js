import React from 'react';

const StatusBadge = ({ status }) => {
  return <span className={`status-badge status-${status}`}>{status}</span>;
};

export default StatusBadge;
