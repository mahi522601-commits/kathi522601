import { Router } from 'express';
import { adminOnly } from '../middleware/adminOnly.js';
import { verifyToken } from '../middleware/auth.js';
import { getSiteSettings, saveSiteSettings } from '../controllers/settingsController.js';

const router = Router();

router.get('/site', getSiteSettings);
router.put('/site', verifyToken, adminOnly, saveSiteSettings);

export default router;
