import axiosInstance from './axiosInstance';

const uploadApi = {
  async uploadSingle(base64, name) {
    const { data } = await axiosInstance.post('/upload/single', { base64, name });
    return data.image;
  },
  async uploadMultiple(images, productName) {
    const { data } = await axiosInstance.post('/upload/multiple', { images, productName });
    return data.images || [];
  },
  async remove(image) {
    const { data } = await axiosInstance.delete('/upload/image', { data: { image } });
    return data.deleted;
  },
};

export default uploadApi;
