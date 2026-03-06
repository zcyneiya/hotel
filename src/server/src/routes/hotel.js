import express from 'express';
import { getHotels, getHotelById, createHotel } from '../controllers/hotelController.js';
import { getMerchantHotels, updateHotel, submitForReview, updateRoomPrice, createPromotion, updatePromotion } from '../controllers/merchantController.js';
import { auth, isMerchant } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: 获取酒店列表
 *     tags: [酒店]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', getHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   get:
 *     summary: 获取酒店详情
 *     tags: [酒店]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 酒店不存在
 */
router.get('/:id', getHotelById);

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: 创建酒店
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *               - city
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         description: 未授权
 */
router.post('/', auth, isMerchant, createHotel);

/**
 * @swagger
 * /api/hotels/merchant/my:
 *   get:
 *     summary: 获取商户的酒店列表
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/merchant/my', auth, isMerchant, getMerchantHotels);

/**
 * @swagger
 * /api/hotels/{id}:
 *   put:
 *     summary: 更新酒店信息
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         description: 未授权
 */
router.put('/:id', auth, isMerchant, updateHotel);

/**
 * @swagger
 * /api/hotels/{id}/submit:
 *   post:
 *     summary: 提交酒店审核
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 提交成功
 *       401:
 *         description: 未授权
 */
router.post('/:id/submit', auth, isMerchant, submitForReview);

/**
 * @swagger
 * /api/hotels/{id}/room-price:
 *   put:
 *     summary: 更新房间价格
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomPrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id/room-price', auth, isMerchant, updateRoomPrice);

/**
 * @swagger
 * /api/hotels/{id}/promotions:
 *   post:
 *     summary: 创建促销活动
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/:id/promotions', auth, isMerchant, createPromotion);

/**
 * @swagger
 * /api/hotels/{id}/promotions/{promoId}:
 *   put:
 *     summary: 更新促销活动
 *     tags: [酒店-商户]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: promoId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/:id/promotions/:promoId', auth, isMerchant, updatePromotion);

export default router;
 