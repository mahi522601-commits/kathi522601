import { Router } from 'express';
import { chat } from '../controllers/chatbotController.js';

const router = Router();

router.post('/', chat);

export default router;
