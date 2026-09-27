import axiosClient from './axiosClient';

export const getUsersRequest = (params) => axiosClient.get('/users', { params });
export const getUserRequest = (id) => axiosClient.get(`/users/${id}`);
export const createUserRequest = (payload) => axiosClient.post('/users', payload);
export const updateUserRequest = (id, payload) => axiosClient.put(`/users/${id}`, payload);
export const deleteUserRequest = (id) => axiosClient.delete(`/users/${id}`);
