import { Router } from 'express';
import { createPayuOrder, verifyPayuPayment } from '../controllers/paymentsController.js';

const router = Router();

router.post('/payu/order', createPayuOrder);
router.post('/payu/verify', verifyPayuPayment);

export default router;
