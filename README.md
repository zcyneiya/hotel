# 易宿酒店预订平台

## 项目简介

易宿酒店预订平台是一个面向现代旅游出行场景的综合服务体系，连接酒店商家与消费者，提供高效的信息交互服务。项目包含移动端、管理端与后端服务。

## 项目结构

```
hotel/
├── src/
│   ├── mobile-rn/       # 移动端 (React Native + Expo)
│   ├── admin/           # PC端管理后台 (React + Ant Design)
│   └── server/          # 后端服务 (Node.js + Express + MongoDB)
├── doc/                 # 项目文档
│   └── progress.md      # 项目进度追踪
└── README.md
```

## 技术栈

### 移动端
- **框架**: React Native + Expo
- **导航**: React Navigation 6
- **语言**: TypeScript
- **HTTP**: Axios
- **地图**: WebView + 高德 JS API
- **样式**: StyleSheet

### PC端管理后台
- **框架**: React 18
- **UI组件**: Ant Design 5.x
- **路由**: React Router 6
- **状态管理**: Zustand
- **表单**: React Hook Form
- **构建工具**: Vite

### 后端服务
- **运行时**: Node.js 18+
- **框架**: Express
- **数据库**: MongoDB
- **ORM**: Mongoose
- **认证**: JWT
- **上传**: Multer
- **地图**: 高德 Web 服务 API
- **API文档**: Swagger

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0.0（或 pnpm）

### 安装依赖

```bash
# 移动端
# 1) 创建 Expo + TypeScript 项目（首次搭建时执行）
npx create-expo-app src/mobile-rn -t expo-template-blank-typescript
# 2) 安装依赖
cd src/mobile-rn
npm install

# 管理端
cd src/admin
npm install

# 后端
cd src/server
npm install
```

### 启动开发服务

```bash
# 后端服务 (端口: 3000)
cd src/server
npm run dev
# 首次启动时，记得mock一下首页数据
node seedHotels.js

# 管理端 (端口: 5173)
cd src/admin
npm run dev

# 移动端 (Expo)
cd src/mobile-rn
npx expo start
```

### 环境变量（示例）

后端 `src/server/.env`：
```
MONGODB_URI=mongodb://127.0.0.1:27017/hotel
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
AMAP_KEY=你的高德Web服务Key
```

管理端 `src/admin/.env.local`（高德 JS API）：
```
VITE_AMAP_JS_KEY=你的高德JS Key
```

移动端 `src/mobile-rn/.env`（高德 JS API）：
```
EXPO_PUBLIC_AMAP_JS_KEY=你的高德JS Key
EXPO_PUBLIC_AMAP_JS_SECURITY_CODE=你的高德安全密钥
```

如果在真机调试，请将 `src/mobile-rn/src/config.ts` 的 `BASE_URL` 改为电脑局域网 IP（如 `http://192.168.1.8:3000`）。

## 功能模块

### 移动端
- **首页**: 搜索表单 + Banner 轮播 + 热门目的地
- **列表页**: 酒店列表 + 筛选栏 + 下拉刷新 + 上拉加载
- **详情页**: 图片轮播 + 酒店信息 + 设施服务 + 房型列表
- **周边信息**: 景点/交通/商场推荐
- **地图页**: WebView 高德地图 + 分类切换 + 周边列表
- **体验优化**: 骨架屏、回到顶部

### PC端管理后台
- 登录/注册
- 商户信息录入/编辑
- 地图选址 + 自动回填地址/经纬度
- 自动推荐周边信息（景点/交通/商场）
- 管理员审核/发布

### 后端
- 酒店 CRUD、审核流转
- 高德地理编码/周边 POI 代理接口
- 图片上传

## 开发规范

### Git 提交规范
遵循 Conventional Commits 规范：
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链相关

### 代码规范
- ESLint + Prettier
- 组件命名: PascalCase
- 文件命名: kebab-case
- 变量命名: camelCase
