import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getOrderRequest,
  updateOrderRequest,
  assignDriverRequest,
  updateOrderStatusRequest,
  getOrderHistoryRequest,
} from '../api/orderApi';
import { getUsersRequest } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

const NEXT_STATUS = {
  CREATED: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const canManage = user.role === 'ADMIN' || user.role === 'DISPATCHER';

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [orderRes, historyRes] = await Promise.all([
        getOrderRequest(id),
        getOrderHistoryRequest(id),
      ]);
      setOrder(orderRes.data.data);
      setHistory(historyRes.data.data);
      setEditForm({
        customerName: orderRes.data.data.customerName,
        customerPhone: orderRes.data.data.customerPhone,
        pickupAddress: orderRes.data.data.pickupAddress,
        deliveryAddress: orderRes.data.data.deliveryAddress,
        zone: orderRes.data.data.zone,
        weight: orderRes.data.data.weight,
        codAmount: orderRes.data.data.codAmount,
      });

      if (canManage) {
        const usersRes = await getUsersRequest({ role: 'DRIVER' });
        setDrivers(usersRes.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        ...editForm,
        weight: Number(editForm.weight),
        codAmount: Number(editForm.codAmount),
      };
      const res = await updateOrderRequest(id, payload);
      setOrder(res.data.data);
      setMessage('Order updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedDriver) return;
    try {
      const res = await assignDriverRequest(id, selectedDriver);
      setOrder(res.data.data);
      setMessage('Driver assigned successfully.');
      const historyRes = await getOrderHistoryRequest(id);
      setHistory(historyRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign driver');
    }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (!selectedStatus) return;
    try {
      const res = await updateOrderStatusRequest(id, selectedStatus);
      setOrder(res.data.data);
      setMessage('Order status updated successfully.');
      setSelectedStatus('');
      const historyRes = await getOrderHistoryRequest(id);
      setHistory(historyRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!order) return <div className="page">{error || 'Order not found'}</div>;

  const availableStatuses = NEXT_STATUS[order.status] || [];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Order {order.orderId}</h2>
        <StatusBadge status={order.status} />
      </div>

      {error && <div className="alert-error">{error}</div>}
      {message && <div className="alert-success">{message}</div>}

      <div className="card">
        <h3>Details</h3>
        <p>
          <strong>Customer:</strong> {order.customerName} ({order.customerPhone})
        </p>
        <p>
          <strong>Pickup:</strong> {order.pickupAddress}
        </p>
        <p>
          <strong>Delivery:</strong> {order.deliveryAddress}
        </p>
        <p>
          <strong>Zone:</strong> {order.zone}
        </p>
        <p>
          <strong>Weight:</strong> {order.weight} kg
        </p>
        <p>
          <strong>COD Amount:</strong> {order.codAmount}
        </p>
        <p>
          <strong>Delivery Fee:</strong> {order.deliveryFee}
        </p>
        <p>
          <strong>Assigned Driver:</strong> {order.assignedDriver ? order.assignedDriver.name : 'Unassigned'}
        </p>
      </div>

      {canManage && editForm && (
        <div className="card">
          <h3>Update Order</h3>
          <form className="form" onSubmit={handleUpdate}>
            <label>Customer Name</label>
            <input name="customerName" value={editForm.customerName} onChange={handleEditChange} />
            <label>Customer Phone</label>
            <input
              name="customerPhone"
              value={editForm.customerPhone}
              onChange={handleEditChange}
            />
            <label>Pickup Address</label>
            <input
              name="pickupAddress"
              value={editForm.pickupAddress}
              onChange={handleEditChange}
            />
            <label>Delivery Address</label>
            <input
              name="deliveryAddress"
              value={editForm.deliveryAddress}
              onChange={handleEditChange}
            />
            <label>Zone</label>
            <input name="zone" value={editForm.zone} onChange={handleEditChange} />
            <label>Weight (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.01"
              min="0"
              value={editForm.weight}
              onChange={handleEditChange}
            />
            <label>COD Amount</label>
            <input
              name="codAmount"
              type="number"
              step="0.01"
              min="0"
              value={editForm.codAmount}
              onChange={handleEditChange}
            />
            <button type="submit">Save Changes</button>
          </form>
        </div>
      )}

      {canManage && (
        <div className="card">
          <h3>Assign Driver</h3>
          <form className="form-inline" onSubmit={handleAssign}>
            <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)}>
              <option value="">Select a driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.email})
                </option>
              ))}
            </select>
            <button type="submit" disabled={!selectedDriver}>
              Assign
            </button>
          </form>
        </div>
      )}

      {availableStatuses.length > 0 && (
        <div className="card">
          <h3>Update Status</h3>
          <form className="form-inline" onSubmit={handleStatusChange}>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              <option value="">Select new status</option>
              {availableStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button type="submit" disabled={!selectedStatus}>
              Update Status
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>Status History</h3>
        {history.length === 0 ? (
          <p>No history yet.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Updated By</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id}>
                  <td>
                    <StatusBadge status={h.status} />
                  </td>
                  <td>{h.updatedBy ? `${h.updatedBy.name} (${h.updatedBy.role})` : '-'}</td>
                  <td>{new Date(h.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
