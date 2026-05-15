import axiosInstance from './axiosInstance';

const productsApi = {
  async list(params = {}) {
    const { data } = await axiosInstance.get('/products', { params });
    return data.products || [];
  },
  async get(id) {
    const { data } = await axiosInstance.get(`/products/${id}`);
    return data.product;
  },
  async create(payload) {
    const { data } = await axiosInstance.post('/products', payload);
    return data.product;
  },
  async update(id, payload) {
    const { data } = await axiosInstance.put(`/products/${id}`, payload);
    return data.product;
  },
  async remove(id) {
    await axiosInstance.delete(`/products/${id}`);
    return true;
  },
};

export default productsApi;
