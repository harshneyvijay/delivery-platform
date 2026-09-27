import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createUserRequest, updateUserRequest, getUserRequest } from '../api/userApi';

const UserForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'DISPATCHER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      getUserRequest(id)
        .then((res) => {
          const u = res.data.data;
          setForm({ name: u.name, email: u.email, password: '', role: u.role });
        })
        .catch((err) => setError(err.response?.data?.message || 'Failed to load user'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await updateUserRequest(id, payload);
      } else {
        await createUserRequest(form);
      }
      navigate('/users');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  return (
    <div className="page">
      <h2>{isEdit ? 'Edit User' : 'Create User'}</h2>
      <form className="card form" onSubmit={handleSubmit}>
        {error && <div className="alert-error">{error}</div>}

        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password {isEdit && '(leave blank to keep unchanged)'}</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          minLength={6}
          required={!isEdit}
        />

        <label>Role</label>
        <select name="role" value={form.role} onChange={handleChange}>
          <option value="ADMIN">ADMIN</option>
          <option value="DISPATCHER">DISPATCHER</option>
          <option value="DRIVER">DRIVER</option>
        </select>

        <button type="submit">{isEdit ? 'Save Changes' : 'Create User'}</button>
      </form>
    </div>
  );
};

export default UserForm;
