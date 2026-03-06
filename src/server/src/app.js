import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/database.js';
import swaggerSpec from './config/swagger.js';
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import auditRoutes from './routes/audit.js';
import uploadRoutes from './routes/upload.js';
import poiRoutes from './routes/poi.js';
import aiRoutes from './routes/ai.js';

import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 静态资源托管中间件 - 将指定目录下的文件作为静态资源对外提供访问
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Swagger API 文档
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: '易宿酒店预订平台 API 文档'
}));

// 路由中间件
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/audits', auditRoutes);
app.use('/api/upload', uploadRoutes);//图片上传
app.use('/api/poi', poiRoutes);
app.use('/api/ai', aiRoutes);

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
