import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import auditRoutes from './routes/audit.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加 JSON 请求体大小限制
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // 增加 URL 编码请求体大小限制

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/audits', auditRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '易宿酒店预订平台 API 运行中' });
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
});

export default app;
