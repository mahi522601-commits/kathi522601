import axios from 'axios';
import FormData from 'form-data';
import { env } from '../config/environment.js';

const IMGBB_URL = 'https://api.imgbb.com/1/upload';

export async function uploadToImgBB(base64Data, name = 'product-image') {
  if (!env.imgbbApiKey) {
    throw new Error('ImgBB API key is missing');
  }

  const cleanBase64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  const formData = new FormData();
  formData.append('key', env.imgbbApiKey);
  formData.append('image', cleanBase64);
  formData.append('name', name);

  const response = await axios.post(IMGBB_URL, formData, {
    headers: formData.getHeaders(),
    timeout: 30000,
  });

  if (!response.data?.success) {
    throw new Error(`ImgBB upload failed: ${response.data?.error?.message || 'Unknown error'}`);
  }

  const { data } = response.data;
  return {
    url: data.url,
    displayUrl: data.display_url,
    deleteUrl: data.delete_url,
    thumbnail: data.thumb?.url || data.medium?.url || data.url,
    width: Number(data.width || 0),
    height: Number(data.height || 0),
    size: Number(data.size || 0),
    id: data.id,
  };
}

export async function uploadMultipleToImgBB(base64Array, productName) {
  const results = await Promise.all(
    base64Array.map((base64, index) => uploadToImgBB(base64, `${productName}-${index + 1}`)),
  );
  return results;
}

export async function deleteFromImgBB(image = {}) {
  if (!image?.deleteUrl) {
    return false;
  }

  try {
    await axios.get(image.deleteUrl, { timeout: 15000 });
    return true;
  } catch (error) {
    console.warn('ImgBB cleanup failed', error.message);
    return false;
  }
}

export async function deleteManyFromImgBB(images = []) {
  const uniqueImages = Array.from(
    new Map(
      images
        .filter((image) => image?.deleteUrl)
        .map((image) => [image.deleteUrl, image]),
    ).values(),
  );

  await Promise.allSettled(uniqueImages.map(deleteFromImgBB));
  return true;
}
