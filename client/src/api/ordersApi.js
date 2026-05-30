import axiosInstance from './axiosInstance';

const ordersApi = {
  async list(params = {}) {
    const { data } = await axiosInstance.get('/orders', { params });
    return data.orders || [];
  },
  async get(id) {
    const { data } = await axiosInstance.get(`/orders/${id}`);
    return data.order;
  },
  async create(payload) {
    const { data } = await axiosInstance.post('/orders', payload);
    return data.order;
  },
  async update(id, payload) {
    const { data } = await axiosInstance.put(`/orders/${id}`, payload);
    return data.order;
  },
  async remove(id) {
    await axiosInstance.delete(`/orders/${id}`);
    return true;
  },
};

export default ordersApi;
