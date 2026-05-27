import axiosInstance from './axiosInstance';

const contactApi = {
  async submit(payload) {
    const { data } = await axiosInstance.post('/contact', payload);
    return data.message;
  },
};

export default contactApi;
