import express from 'express';
import { geocode, around } from '../controllers/poiController.js';

const router = express.Router();

/**
 * @swagger
 * /api/poi/geocode:
 *   get:
 *     summary: 地理编码（地址转坐标）
 *     tags: [地理位置]
 *     parameters:
 *       - in: query
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: 地址
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: 城市
 *     responses:
 *       200:
 *         description: 获取成功
 *       400:
 *         description: 请求参数错误
 */
router.get('/geocode', geocode);

/**
 * @swagger
 * /api/poi/around:
 *   get:
 *     summary: 周边搜索
 *     tags: [地理位置]
 *     parameters:
 *       - in: query
 *         name: location
 *         required: true
 *         schema:
 *           type: string
 *         description: 坐标（经度,纬度）
 *       - in: query
 *         name: keywords
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: radius
 *         schema:
 *           type: integer
 *         description: 搜索半径（米）
 *     responses:
 *       200:
 *         description: 获取成功
 *       400:
 *         description: 请求参数错误
 */
router.get('/around', around);

export default router;
