import { Router } from 'express';
import { getUnreadNotifications, markAsRead } from '../controllers/notifications.controller.js';
import { verifyToken } from '../middlewares/authJwt.js';

const router = Router();

router.get('/', [verifyToken], getUnreadNotifications);
router.post('/:id/read', [verifyToken], markAsRead);

export default router;