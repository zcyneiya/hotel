import express from 'express';
import { geocode, around } from '../controllers/poiController.js';

const router = express.Router();

router.get('/geocode', geocode);
router.get('/around', around);

export default router;
