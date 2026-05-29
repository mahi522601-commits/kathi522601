import express from 'express';
import { quoteCart } from '../controllers/cartController.js';

const router = express.Router();

router.post('/quote', quoteCart);

export default router;
