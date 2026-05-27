import axiosInstance from './axiosInstance';

const settingsApi = {
  async getSite() {
    const { data } = await axiosInstance.get('/settings/site');
    return data.settings;
  },
  async updateSite(payload) {
    const { data } = await axiosInstance.put('/settings/site', payload);
    return data.settings;
  },
};

export default settingsApi;
