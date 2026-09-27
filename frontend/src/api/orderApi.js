import axiosClient from './axiosClient';

export const createOrderRequest = (payload) => axiosClient.post('/orders', payload);
export const getOrdersRequest = (params) => axiosClient.get('/orders', { params });
export const getOrderRequest = (id) => axiosClient.get(`/orders/${id}`);
export const updateOrderRequest = (id, payload) => axiosClient.put(`/orders/${id}`, payload);
export const deleteOrderRequest = (id) => axiosClient.delete(`/orders/${id}`);
export const assignDriverRequest = (id, driverId) =>
  axiosClient.put(`/orders/${id}/assign`, { driverId });
export const updateOrderStatusRequest = (id, status) =>
  axiosClient.put(`/orders/${id}/status`, { status });
export const getOrderHistoryRequest = (id) => axiosClient.get(`/orders/${id}/history`);
