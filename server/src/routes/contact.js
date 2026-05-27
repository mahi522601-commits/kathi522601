import { Router } from 'express';
import { createContactMessage, getContactMessages, markMessageRead } from '../controllers/contactController.js';
import { verifyToken } from '../middleware/auth.js';
import { adminOnly } from '../middleware/adminOnly.js';

const router = Router();

// Public — submit a contact form
router.post('/', createContactMessage);

// Admin only — view all messages
router.get('/messages', verifyToken, adminOnly, getContactMessages);

// Admin only — mark a message as read
router.put('/messages/:id/read', verifyToken, adminOnly, markMessageRead);

export default router;