import { Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { verifyToken } from '../middleware/auth.js';
import {
  createProduct,
  getProduct,
  getProducts,
  removeProduct,
  updateProduct,
} from '../controllers/productsController.js';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', verifyToken, adminOnly, createProduct);
router.put('/:id', verifyToken, adminOnly, updateProduct);
router.delete('/:id', verifyToken, adminOnly, removeProduct);

export default router;
