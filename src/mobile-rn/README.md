# React Native 酒店预订应用

这是从 Taro 框架迁移到 React Native 的酒店预订移动端应用。

## 技术栈

- React Native 0.73+
- React Navigation 6
- TypeScript
- Axios (API 请求)

## 项目结构

```
src/
├── navigation/          # 导航配置
│   └── AppNavigator.tsx
├── screens/            # 页面组件
│   ├── HomeScreen.tsx  # 首页（搜索 + Banner + 目的地）
│   ├── ListScreen.tsx  # 列表页（酒店列表 + 筛选）
│   └── DetailScreen.tsx # 详情页（酒店详情 + 房型）
├── services/           # API 服务
│   └── hotelService.ts
├── utils/              # 工具函数
│   └── request.ts      # HTTP 请求封装
└── types/              # TypeScript 类型定义
    └── hotel.ts
```

## 功能特性

### 首页
- 顶部 Banner 轮播广告
- 搜索表单（目的地、关键字、日期、星级、价格）
- 快捷标签筛选
- 热门目的地推荐

### 列表页
- 酒店列表展示
- 下拉刷新
- 上拉加载更多
- 顶部筛选栏
- 收藏功能

### 详情页
- 酒店图片轮播
- 基本信息展示
- 设施服务列表
- 房型列表及价格
- 预订功能

## 安装依赖

```bash
cd src/mobile-rn
npm install
# 或
yarn install
```

## iOS 配置

```bash
cd ios
pod install
cd ..
```

## 运行项目

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

## API 配置

默认 API 地址：`http://localhost:3000/api`

可在 `src/utils/request.ts` 中修改：

```typescript
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://your-production-api.com/api';
```

## 开发说明

### 添加新页面

1. 在 `src/screens/` 创建新的页面组件
2. 在 `src/navigation/AppNavigator.tsx` 中注册路由
3. 更新 `RootStackParamList` 类型定义

### 添加新的 API 服务

1. 在 `src/types/` 定义数据类型
2. 在 `src/services/` 创建服务文件
3. 使用 `request` 工具发起请求

## UI 设计

采用爱彼迎（Airbnb）风格设计：
- 主色调：#FF385C（粉红色）
- 圆角卡片设计
- 简洁的图标和排版
- 流畅的动画过渡

## 注意事项

1. 确保后端 API 服务已启动（端口 3000）
2. iOS 需要配置网络权限（Info.plist）
3. Android 需要配置网络权限（AndroidManifest.xml）
4. 图片资源使用 Unsplash 免费图片

## 与 Taro 版本对比

| 特性 | Taro | React Native |
|------|------|--------------|
| 框架 | Taro 3.x | React Native 0.73+ |
| 导航 | Taro.navigateTo | React Navigation |
| 组件 | Taro Components | React Native Components |
| 样式 | SCSS | StyleSheet |
| 请求 | Taro.request | Axios |
| 状态管理 | React Hooks | React Hooks |

## 后续优化

- [ ] 添加日期选择器组件
- [ ] 实现筛选功能
- [ ] 添加地图定位
- [ ] 集成支付功能
- [ ] 添加用户登录
- [ ] 优化图片加载性能
- [ ] 添加骨架屏加载
- [ ] 实现离线缓存

## License

MIT
