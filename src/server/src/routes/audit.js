import express from 'express';
import { 
  getPendingHotels, 
  getAllHotels, 
  approveHotel, 
  rejectHotel, 
  offlineHotel,
  getOfflineHotels,
  restoreHotel,
  getAuditLogs 
} from '../controllers/adminController.js';
import { auth, isAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/audits/hotels/pending:
 *   get:
 *     summary: 获取待审核酒店列表
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/hotels/pending', auth, isAdmin, getPendingHotels);

/**
 * @swagger
 * /api/audits/hotels/offline:
 *   get:
 *     summary: 获取已下线酒店列表
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/hotels/offline', auth, isAdmin, getOfflineHotels);

/**
 * @swagger
 * /api/audits/hotels:
 *   get:
 *     summary: 获取所有酒店列表
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/hotels', auth, isAdmin, getAllHotels);

/**
 * @swagger
 * /api/audits/hotels/{id}/approve:
 *   post:
 *     summary: 审核通过酒店
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     responses:
 *       200:
 *         description: 审核通过
 *       401:
 *         description: 未授权
 */
router.post('/hotels/:id/approve', auth, isAdmin, approveHotel);

/**
 * @swagger
 * /api/audits/hotels/{id}/reject:
 *   post:
 *     summary: 拒绝酒店审核
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 拒绝原因
 *     responses:
 *       200:
 *         description: 拒绝成功
 *       401:
 *         description: 未授权
 */
router.post('/hotels/:id/reject', auth, isAdmin, rejectHotel);

/**
 * @swagger
 * /api/audits/hotels/{id}/offline:
 *   post:
 *     summary: 下线酒店
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     responses:
 *       200:
 *         description: 下线成功
 *       401:
 *         description: 未授权
 */
router.post('/hotels/:id/offline', auth, isAdmin, offlineHotel);

/**
 * @swagger
 * /api/audits/hotels/{id}/restore:
 *   post:
 *     summary: 恢复已下线酒店
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     responses:
 *       200:
 *         description: 恢复成功
 *       401:
 *         description: 未授权
 */
router.post('/hotels/:id/restore', auth, isAdmin, restoreHotel);

/**
 * @swagger
 * /api/audits/hotels/{hotelId}/logs:
 *   get:
 *     summary: 获取酒店审核日志
 *     tags: [审核-管理员]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: hotelId
 *         required: true
 *         schema:
 *           type: string
 *         description: 酒店ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/hotels/:hotelId/logs', auth, isAdmin, getAuditLogs);

export default router;
