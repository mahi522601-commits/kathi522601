import axiosInstance from './axiosInstance';

const paymentsApi = {
  async createRazorpayOrder(payload) {
    const { data } = await axiosInstance.post(
      '/payments/razorpay/order',
      payload,
    );

    return data;
  },

  async verifyRazorpayPayment(payload) {
    const { data } = await axiosInstance.post(
      '/payments/razorpay/verify',
      payload,
    );

    return data;
  },
};

export default paymentsApi;