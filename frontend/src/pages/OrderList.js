import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrdersRequest } from '../api/orderApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const loadOrders = () => {
    setLoading(true);
    getOrdersRequest()
      .then((res) => setOrders(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Orders</h2>
        {(user.role === 'ADMIN' || user.role === 'DISPATCHER') && (
          <Link className="btn" to="/orders/new">
            + Create Order
          </Link>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Zone</th>
              <th>Delivery Fee</th>
              <th>Driver</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.orderId}</td>
                <td>{order.customerName}</td>
                <td>{order.zone}</td>
                <td>{order.deliveryFee}</td>
                <td>{order.assignedDriver ? order.assignedDriver.name : '-'}</td>
                <td>
                  <StatusBadge status={order.status} />
                </td>
                <td>
                  <Link to={`/orders/${order._id}`}>View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default OrderList;
