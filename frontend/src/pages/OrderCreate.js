import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createOrderRequest } from '../api/orderApi';

const OrderCreate = () => {
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    pickupAddress: '',
    deliveryAddress: '',
    zone: '',
    weight: '',
    codAmount: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        ...form,
        weight: Number(form.weight),
        codAmount: form.codAmount ? Number(form.codAmount) : 0,
      };
      const res = await createOrderRequest(payload);
      navigate(`/orders/${res.data.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h2>Create Order</h2>
      <form className="card form" onSubmit={handleSubmit}>
        {error && <div className="alert-error">{error}</div>}

        <label>Customer Name</label>
        <input name="customerName" value={form.customerName} onChange={handleChange} required />

        <label>Customer Phone</label>
        <input
          name="customerPhone"
          value={form.customerPhone}
          onChange={handleChange}
          required
        />

        <label>Pickup Address</label>
        <input name="pickupAddress" value={form.pickupAddress} onChange={handleChange} required />

        <label>Delivery Address</label>
        <input
          name="deliveryAddress"
          value={form.deliveryAddress}
          onChange={handleChange}
          required
        />

        <label>Zone</label>
        <input name="zone" value={form.zone} onChange={handleChange} required />

        <label>Weight (kg)</label>
        <input
          name="weight"
          type="number"
          step="0.01"
          min="0"
          value={form.weight}
          onChange={handleChange}
          required
        />

        <label>COD Amount</label>
        <input
          name="codAmount"
          type="number"
          step="0.01"
          min="0"
          value={form.codAmount}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  );
};

export default OrderCreate;
