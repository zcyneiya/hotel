import express from 'express';
import { getHotels, getHotelById, createHotel } from '../controllers/hotelController.js';
import { getMerchantHotels, updateHotel, submitForReview, updateRoomPrice, createPromotion, updatePromotion } from '../controllers/merchantController.js';
import { auth, isMerchant } from '../middleware/auth.js';

const router = express.Router();

// 公开接口 - 用户端
router.get('/', getHotels);
router.get('/:id', getHotelById);

// 商户接口
router.post('/', auth, isMerchant, createHotel);
router.get('/merchant/my', auth, isMerchant, getMerchantHotels);
router.put('/:id', auth, isMerchant, updateHotel);
router.post('/:id/submit', auth, isMerchant, submitForReview);
router.put('/:id/room-price', auth, isMerchant, updateRoomPrice);
router.post('/:id/promotions', auth, isMerchant, createPromotion);
router.put('/:id/promotions/:promoId', auth, isMerchant, updatePromotion);

export default router;
