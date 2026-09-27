import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsersRequest, deleteUserRequest } from '../api/userApi';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUsers = () => {
    setLoading(true);
    getUsersRequest()
      .then((res) => setUsers(res.data.data))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUserRequest(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Users</h2>
        <Link className="btn" to="/users/new">
          + Create User
        </Link>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>
                  <Link to={`/users/${u._id}/edit`}>Edit</Link>{' '}
                  <button className="link-button" onClick={() => handleDelete(u._id)}>
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

export default UserList;
