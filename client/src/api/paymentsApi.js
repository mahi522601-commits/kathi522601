import axiosInstance from './axiosInstance';

const paymentsApi = {
  async createPayuOrder(payload) {
    const { data } = await axiosInstance.post('/payments/payu/order', payload);
    return data;
  },

  async verifyPayuPayment(payload) {
    const { data } = await axiosInstance.post('/payments/payu/verify', payload);
    return data;
  },
};

export default paymentsApi;