import axiosInstance from './axiosInstance';

const cartApi = {
  async quote(items) {
    const { data } = await axiosInstance.post('/cart/quote', { items });
    return data.cart || { items: [], unavailableItems: [], subtotal: 0, itemCount: 0 };
  },
};

export default cartApi;
