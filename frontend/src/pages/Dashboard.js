import React, { useEffect, useState } from 'react';
import { getOrdersRequest } from '../api/orderApi';

const STATUS_LIST = [
  'CREATED',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

const Dashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getOrdersRequest()
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const counts = STATUS_LIST.reduce((acc, status) => {
    acc[status] = orders.filter((o) => o.status === status).length;
    return acc;
  }, {});

  return (
    <div className="page">
      <h2>Dashboard</h2>
      {error && <div className="alert-error">{error}</div>}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="card">
            <h3>Total Orders: {orders.length}</h3>
          </div>
          <div className="status-grid">
            {STATUS_LIST.map((status) => (
              <div className="card status-count-card" key={status}>
                <div className="status-count-label">{status}</div>
                <div className="status-count-value">{counts[status]}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
