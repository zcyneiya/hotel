import express from 'express';
import { 
  getPendingHotels, 
  getAllHotels, 
  approveHotel, 
  rejectHotel, 
  offlineHotel,
  getAuditLogs 
} from '../controllers/adminController.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// 管理员接口
router.get('/hotels/pending', auth, isAdmin, getPendingHotels);
router.get('/hotels', auth, isAdmin, getAllHotels);
router.post('/hotels/:id/approve', auth, isAdmin, approveHotel);
router.post('/hotels/:id/reject', auth, isAdmin, rejectHotel);
router.post('/hotels/:id/offline', auth, isAdmin, offlineHotel);
router.get('/hotels/:hotelId/logs', auth, isAdmin, getAuditLogs);

export default router;
