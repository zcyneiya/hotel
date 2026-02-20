import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保目录存在
const uploadDir = path.join(__dirname, '../../public/uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // 生成唯一ID
    const uniqueId = uuidv4();
    // 获取原始扩展名 (.jpg, .png)
    const ext = path.extname(file.originalname).toLowerCase();
    // 文件名：uuid + 扩展名
    cb(null, `${uniqueId}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片'));
    }
  }
});

// 上传接口 POST /api/upload/image
router.post('/image', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '请选择文件' });
  }

  // 拼接完整的访问 URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${baseUrl}/uploads/images/${req.file.filename}`;

  res.json({
    code: 200,
    message: '上传成功',
    data: {
      url: fileUrl,
      id: req.file.filename.split('.')[0], 
      filename: req.file.filename
    }
  });
});

export default router;