import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPricingConfigsRequest, deletePricingConfigRequest } from '../api/pricingApi';

const PricingList = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadConfigs = () => {
    setLoading(true);
    getPricingConfigsRequest()
      .then((res) => setConfigs(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load pricing'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pricing configuration?')) return;
    try {
      await deletePricingConfigRequest(id);
      loadConfigs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete pricing configuration');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Pricing Configuration</h2>
        <Link className="btn" to="/pricing/new">
          + Create Pricing
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>Base Price</th>
              <th>Price / Kg</th>
              <th>COD Fee</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c._id}>
                <td>{c.zone}</td>
                <td>{c.basePrice}</td>
                <td>{c.pricePerKg}</td>
                <td>{c.codFee}</td>
                <td>
                  <Link to={`/pricing/${c._id}/edit`}>Edit</Link>{' '}
                  <button className="link-button" onClick={() => handleDelete(c._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PricingList;
