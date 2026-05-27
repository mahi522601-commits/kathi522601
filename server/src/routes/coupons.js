import { Router } from 'express';
import {
  createCoupon,
  getCoupons,
  removeCoupon,
  updateCoupon,
  validateCoupon,
} from '../controllers/couponsController.js';
import { adminOnly } from '../middleware/adminOnly.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getCoupons);
router.post('/validate', validateCoupon);
router.post('/', verifyToken, adminOnly, createCoupon);
router.put('/:code', verifyToken, adminOnly, updateCoupon);
router.delete('/:code', verifyToken, adminOnly, removeCoupon);

export default router;
