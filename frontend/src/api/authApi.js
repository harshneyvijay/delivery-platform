import axiosClient from './axiosClient';

export const registerRequest = (payload) => axiosClient.post('/auth/register', payload);
export const loginRequest = (payload) => axiosClient.post('/auth/login', payload);
export const meRequest = () => axiosClient.get('/auth/me');
