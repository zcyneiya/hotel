import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'; // Add this line
import { fileURLToPath } from 'url'; // Add this for ES modules path
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import auditRoutes from './routes/audit.js';
import uploadRoutes from './routes/upload.js';
import poiRoutes from './routes/poi.js'; 


import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url); // Add this for ES modules path
const __dirname = path.dirname(__filename); // Add this for ES modules path

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' })); // 增加 JSON 请求体大小限制
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // 增加 URL 编码请求体大小限制

// 托管静态资源 - 现在可以通过 /uploads/images/filename.jpg 访问
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/upload', uploadRoutes); // Register upload route
app.use('/api/poi', poiRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: '易宿酒店预订平台 API 运行中' });
});

// 错误处理
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 服务器运行在 http://0.0.0.0:${PORT}`);
});

export default app;
