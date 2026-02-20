# 易宿酒店预订平台

## 项目简介

易宿酒店预订平台是一个面向现代旅游出行场景的综合服务体系，连接酒店商家与消费者，提供高效的信息交互服务。

## 项目结构

```
hotel/
├── src/
│   ├── mobile-rn/       # 移动端 (React Native + expo)
│   ├── admin/           # PC端管理后台 (React + Ant Design)
│   └── server/          # 后端服务 (Node.js + Express + mangoDB)
├── doc/                 # 项目文档
│   └── progress.md      # 项目进度追踪
└── README.md
```

## 技术栈

### 移动端
- **框架**: React Native 0.73+
- **导航**: React Navigation 6
- **语言**: TypeScript
- **HTTP**: Axios
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
- **API文档**: Swagger

## 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 5.0
- pnpm >= 8.0.0

### 安装依赖

```bash

# 移动端 (ios)
# 1) 创建 Expo + TypeScript 项目（首次搭建时执行）
npx create-expo-app src/mobile-rn -t expo-template-blank-typescript
# 2) 安装依赖
cd src/mobile-rn
npm install

# 管理端
cd src/admin
pnpm install

# 后端
cd src/server
pnpm install
```

### 启动开发服务

```bash
# 后端服务 (端口: 3000)
cd src/server
pnpm dev

# 管理端 (端口: 5173)
cd src/admin
pnpm dev

# 移动端 (expo)
cd src/mobile-rn
npx expo start
```

## 功能模块

### 移动端
- **首页**: 搜索表单 + Banner 轮播 + 热门目的地
- **列表页**: 酒店列表 + 筛选栏 + 下拉刷新 + 上拉加载
- **详情页**: 图片轮播 + 酒店信息 + 设施服务 + 房型列表

### PC端管理后台
- 登录/注册
- 商户信息录入/编辑
- 管理员审核/发布

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
