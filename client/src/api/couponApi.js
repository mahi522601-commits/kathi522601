import axiosInstance from './axiosInstance';

const couponApi = {
  async list() {
    const { data } = await axiosInstance.get('/coupons');
    return data.coupons || [];
  },
  async validate(code, subtotal) {
    const { data } = await axiosInstance.post('/coupons/validate', { code, subtotal });
    return data.coupon;
  },
  async create(payload) {
    const { data } = await axiosInstance.post('/coupons', payload);
    return data.coupon;
  },
  async update(code, payload) {
    const { data } = await axiosInstance.put(`/coupons/${code}`, payload);
    return data.coupon;
  },
  async remove(code) {
    await axiosInstance.delete(`/coupons/${code}`);
    return true;
  },
};

export default couponApi;
