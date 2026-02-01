# 易宿酒店移动端

## 项目结构

```
mobile/
├── src/
│   ├── app.jsx               # 应用入口
│   ├── app.config.js         # 应用配置
│   ├── app.scss              # 全局样式
│   ├── pages/
│   │   ├── index/            # 酒店查询页（首页）
│   │   │   ├── index.jsx
│   │   │   ├── index.scss
│   │   │   └── index.config.js
│   │   ├── list/             # 酒店列表页
│   │   │   ├── index.jsx
│   │   │   ├── index.scss
│   │   │   └── index.config.js
│   │   └── detail/           # 酒店详情页
│   │       ├── index.jsx
│   │       ├── index.scss
│   │       └── index.config.js
│   ├── components/           # 组件目录
│   ├── services/
│   │   └── api.js            # API 服务
│   ├── store/                # 状态管理
│   └── utils/
│       └── request.js        # HTTP 请求封装
├── config/
│   ├── index.js              # Taro 配置
│   ├── dev.js                # 开发环境配置
│   └── prod.js               # 生产环境配置
└── package.json
```

## 安装依赖

```bash
npm install
```

## 启动开发

### 微信小程序
```bash
npm run dev:weapp
```

### H5
```bash
npm run dev:h5
```

访问 http://localhost:10086

## 功能说明

### 酒店查询页（首页）
- Banner 轮播展示
- 地点选择
- 关键字搜索
- 日期选择（待实现自定义日历组件）
- 快捷标签筛选

### 酒店列表页
- 酒店列表展示
- 无限滚动加载
- 点击跳转详情

### 酒店详情页
- 图片轮播
- 酒店基础信息
- 设施展示
- 房型价格列表（价格从低到高）

## 待实现功能

- 自定义日历组件
- 筛选功能
- 地理定位
- 图片上传

## 构建生产版本

```bash
npm run build:weapp  # 微信小程序
npm run build:h5     # H5
```
