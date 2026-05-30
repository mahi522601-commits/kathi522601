import { Router } from 'express';
import {
  createOrder,
  getOrder,
  getOrders,
  removeOrder,
  updateOrder,
} from '../controllers/ordersController.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrder);
router.post('/', createOrder);
router.put('/:id', verifyToken, adminOnly, updateOrder);
router.delete('/:id', verifyToken, adminOnly, removeOrder);

export default router;
