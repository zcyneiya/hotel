# 易宿酒店预订平台

## 项目简介

易宿酒店预订平台是一个面向现代旅游出行场景的综合服务体系，连接酒店商家与消费者，提供高效的信息交互服务。

## 项目结构

```
hotel/
├── src/
│   ├── mobile/          # 移动端 (Taro 跨端框架)
│   ├── admin/           # PC端管理后台 (React + Ant Design)
│   └── server/          # 后端服务 (Node.js + Express)
├── doc/                 # 项目文档
│   └── progress.md      # 项目进度追踪
└── README.md
```

## 技术栈

### 移动端
- **框架**: Taro 3.x
- **UI组件**: Taro UI
- **状态管理**: Zustand
- **样式**: SCSS

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
# 移动端
cd src/mobile
pnpm install

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

# 移动端 - 微信小程序
cd src/mobile
pnpm dev:weapp

# 移动端 - H5
cd src/mobile
pnpm dev:h5
```

## 功能模块

### 移动端
- 酒店查询页 (首页)
- 酒店列表页
- 酒店详情页

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

## 项目进度

详见 [doc/progress.md](./doc/progress.md)

## License

MIT
