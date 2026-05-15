import axiosInstance from './axiosInstance';

const authApi = {
  async getCurrentUser() {
    const { data } = await axiosInstance.get('/users/me');
    return data.user;
  },
  async updateCurrentUser(payload) {
    const { data } = await axiosInstance.put('/users/me', payload);
    return data.user;
  },
};

export default authApi;
