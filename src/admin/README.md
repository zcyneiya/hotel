# 易宿酒店管理后台

## 项目结构

```
admin/
├── src/
│   ├── main.jsx              # 应用入口
│   ├── App.jsx               # 路由配置
│   ├── index.css             # 全局样式
│   ├── pages/
│   │   ├── Login.jsx         # 登录页
│   │   ├── Register.jsx      # 注册页
│   │   ├── Merchant/         # 商户端
│   │   │   ├── Layout.jsx    # 商户布局
│   │   │   ├── Hotels.jsx    # 酒店列表
│   │   │   └── HotelForm.jsx # 酒店表单
│   │   └── Admin/            # 管理员端
│   │       ├── Layout.jsx    # 管理员布局
│   │       ├── Audit.jsx     # 审核管理
│   │       └── Hotels.jsx    # 酒店管理
│   ├── services/
│   │   └── api.js            # API 服务
│   ├── store/
│   │   └── authStore.js      # 认证状态管理
│   └── utils/
│       └── request.js        # HTTP 请求封装
├── index.html
├── vite.config.js
└── package.json
```

## 安装依赖

```bash
npm install
```

## 启动开发服务

```bash
npm run dev
```

访问 http://localhost:5173

## 功能说明

### 商户端
- 登录/注册（选择商户角色）
- 酒店信息录入/编辑
- 提交审核
- 查看审核状态

### 管理员端
- 登录/注册（选择管理员角色）
- 审核待审核酒店
- 通过/驳回审核
- 下线已发布酒店
- 查看所有酒店

## 构建生产版本

```bash
npm run build
```
