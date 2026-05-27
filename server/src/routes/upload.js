import { Router } from 'express';
import { verifyToken } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { deleteImage, uploadImage, uploadMultipleImages } from '../controllers/uploadController.js';

const router = Router();

router.post('/single', verifyToken, adminOnly, uploadImage);
router.post('/multiple', verifyToken, adminOnly, uploadMultipleImages);
router.delete('/image', verifyToken, adminOnly, deleteImage);

export default router;
