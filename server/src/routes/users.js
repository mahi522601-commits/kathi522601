import { Router } from 'express';
import { getCurrentUser, updateCurrentUser } from '../controllers/usersController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

router.get('/me', verifyToken, getCurrentUser);
router.put('/me', verifyToken, updateCurrentUser);

export default router;
