import axiosClient from './axiosClient';

export const getPricingConfigsRequest = () => axiosClient.get('/pricing');
export const createPricingConfigRequest = (payload) => axiosClient.post('/pricing', payload);
export const updatePricingConfigRequest = (id, payload) =>
  axiosClient.put(`/pricing/${id}`, payload);
export const deletePricingConfigRequest = (id) => axiosClient.delete(`/pricing/${id}`);
