import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createPricingConfigRequest,
  updatePricingConfigRequest,
  getPricingConfigsRequest,
} from '../api/pricingApi';

const PricingForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ zone: '', basePrice: '', pricePerKg: '', codFee: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getPricingConfigsRequest()
        .then((res) => {
          const config = res.data.data.find((c) => c._id === id);
          if (config) {
            setForm({
              zone: config.zone,
              basePrice: config.basePrice,
              pricePerKg: config.pricePerKg,
              codFee: config.codFee,
            });
          } else {
            setError('Pricing configuration not found');
          }
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load pricing'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        zone: form.zone,
        basePrice: Number(form.basePrice),
        pricePerKg: Number(form.pricePerKg),
        codFee: Number(form.codFee),
      };
      if (isEdit) {
        await updatePricingConfigRequest(id, payload);
      } else {
        await createPricingConfigRequest(payload);
      }
      navigate('/pricing');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save pricing configuration');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>{isEdit ? 'Edit Pricing Configuration' : 'Create Pricing Configuration'}</h2>
      <form className="card form" onSubmit={handleSubmit}>
        {error && <div className="alert-error">{error}</div>}

        <label>Zone</label>
        <input name="zone" value={form.zone} onChange={handleChange} required />

        <label>Base Price</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="basePrice"
          value={form.basePrice}
          onChange={handleChange}
          required
        />

        <label>Price Per Kg</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="pricePerKg"
          value={form.pricePerKg}
          onChange={handleChange}
          required
        />

        <label>COD Fee</label>
        <input
          type="number"
          step="0.01"
          min="0"
          name="codFee"
          value={form.codFee}
          onChange={handleChange}
          required
        />

        <button type="submit">{isEdit ? 'Save Changes' : 'Create Pricing'}</button>
      </form>
    </div>
  );
};

export default PricingForm;
