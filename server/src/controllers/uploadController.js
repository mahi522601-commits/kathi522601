import { deleteFromImgBB, uploadMultipleToImgBB, uploadToImgBB } from '../services/imgbb.js';

export async function uploadImage(req, res, next) {
  try {
    const { base64, name } = req.body;
    if (!base64) {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    const image = await uploadToImgBB(base64, name);
    res.json({ success: true, image });
  } catch (error) {
    next(error);
  }
}

export async function uploadMultipleImages(req, res, next) {
  try {
    const { images, productName } = req.body;
    if (!images?.length) {
      return res.status(400).json({ success: false, error: 'No images provided' });
    }

    const uploaded = await uploadMultipleToImgBB(
      images.map((image) => image.base64),
      productName || 'product',
    );
    res.json({ success: true, images: uploaded });
  } catch (error) {
    next(error);
  }
}

export async function deleteImage(req, res, next) {
  try {
    const deleted = await deleteFromImgBB(req.body?.image || req.body);
    res.json({ success: true, deleted });
  } catch (error) {
    next(error);
  }
}
