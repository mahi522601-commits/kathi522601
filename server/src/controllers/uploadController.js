import { deleteFromImgBB, uploadMultipleToImgBB, uploadToImgBB } from '../services/imgbb.js';

function assertImageData(base64) {
  if (!base64) {
    const error = new Error('No image data provided');
    error.status = 400;
    throw error;
  }

  if (!/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(base64)) {
    const error = new Error('Only JPG, PNG, or WebP images are allowed');
    error.status = 400;
    throw error;
  }
}

export async function uploadImage(req, res, next) {
  try {
    const { base64, name } = req.body;
    assertImageData(base64);

    const image = await uploadToImgBB(base64, name);
    res.json({ success: true, image });
  } catch (error) {
    next(error);
  }
}

export async function uploadPaymentProof(req, res, next) {
  try {
    const { base64, name } = req.body;
    assertImageData(base64);

    const image = await uploadToImgBB(base64, name || `payment-proof-${Date.now()}`);
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
