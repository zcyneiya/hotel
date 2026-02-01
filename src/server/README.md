# 易宿酒店预订平台 - 后端服务

## 项目结构

```
server/
├── src/
│   ├── app.js                 # 应用入口
│   ├── config/
│   │   └── database.js        # 数据库配置
│   ├── models/
│   │   ├── User.js            # 用户模型
│   │   ├── Hotel.js           # 酒店模型
│   │   └── Audit.js           # 审核记录模型
│   ├── controllers/
│   │   ├── authController.js      # 认证控制器
│   │   ├── hotelController.js     # 酒店控制器
│   │   ├── merchantController.js  # 商户控制器
│   │   └── adminController.js     # 管理员控制器
│   ├── routes/
│   │   ├── auth.js            # 认证路由
│   │   ├── hotel.js           # 酒店路由
│   │   └── audit.js           # 审核路由
│   ├── middleware/
│   │   ├── auth.js            # 认证中间件
│   │   └── errorHandler.js   # 错误处理中间件
│   └── utils/                 # 工具函数
├── .env.example               # 环境变量示例
└── package.json
```

## 安装依赖

```bash
npm install
```

## 环境配置

复制 `.env.example` 为 `.env` 并配置：

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/hotel
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development
```

## 启动服务

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

## API 文档

### 认证接口

#### 注册
- **POST** `/api/auth/register`
- Body: `{ username, password, role, email, phone }`

#### 登录
- **POST** `/api/auth/login`
- Body: `{ username, password }`

#### 获取当前用户
- **GET** `/api/auth/me`
- Headers: `Authorization: Bearer <token>`

### 酒店接口

#### 获取酒店列表（用户端）
- **GET** `/api/hotels?city=&keyword=&starLevel=&page=1&limit=10`

#### 获取酒店详情
- **GET** `/api/hotels/:id`

#### 创建酒店（商户）
- **POST** `/api/hotels`
- Headers: `Authorization: Bearer <token>`

#### 获取我的酒店（商户）
- **GET** `/api/hotels/merchant/my`
- Headers: `Authorization: Bearer <token>`

#### 更新酒店（商户）
- **PUT** `/api/hotels/:id`
- Headers: `Authorization: Bearer <token>`

#### 提交审核（商户）
- **POST** `/api/hotels/:id/submit`
- Headers: `Authorization: Bearer <token>`

### 审核接口（管理员）

#### 获取待审核酒店
- **GET** `/api/audits/hotels/pending`
- Headers: `Authorization: Bearer <token>`

#### 获取所有酒店
- **GET** `/api/audits/hotels?status=`
- Headers: `Authorization: Bearer <token>`

#### 审核通过
- **POST** `/api/audits/hotels/:id/approve`
- Headers: `Authorization: Bearer <token>`

#### 审核驳回
- **POST** `/api/audits/hotels/:id/reject`
- Headers: `Authorization: Bearer <token>`
- Body: `{ reason }`

#### 下线酒店
- **POST** `/api/audits/hotels/:id/offline`
- Headers: `Authorization: Bearer <token>`

#### 获取审核记录
- **GET** `/api/audits/hotels/:hotelId/logs`
- Headers: `Authorization: Bearer <token>`
