# React Native 酒店预订应用 - 安装指南

## 环境要求

- Node.js >= 18
- React Native CLI
- Xcode (iOS 开发)
- Android Studio (Android 开发)

## 快速开始

### 1. 安装依赖

```bash
cd src/mobile-rn
npm install
```

### 2. iOS 配置

```bash
cd ios
pod install
cd ..
```

### 3. 运行项目

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

## 配置说明

### API 地址配置

在 `src/utils/request.ts` 中修改 API 地址：

```typescript
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'  // 开发环境
  : 'https://your-api.com/api';  // 生产环境
```

### Android 网络权限

已在 `android/app/src/main/AndroidManifest.xml` 中配置：
- `INTERNET` 权限
- `usesCleartextTraffic` 允许 HTTP 请求

### iOS 网络权限

已在 `ios/HotelApp/Info.plist` 中配置：
- `NSAppTransportSecurity` 允许 HTTP 请求
- `NSLocationWhenInUseUsageDescription` 位置权限说明

## 常见问题

### 1. Metro bundler 端口被占用

```bash
npx react-native start --reset-cache
```

### 2. iOS 构建失败

```bash
cd ios
pod deintegrate
pod install
cd ..
```

### 3. Android 构建失败

```bash
cd android
./gradlew clean
cd ..
```

### 4. 无法连接到 API

确保：
- 后端服务已启动（http://localhost:3000）
- Android 模拟器使用 `10.0.2.2:3000` 访问本机
- iOS 模拟器使用 `localhost:3000` 访问本机

## 项目结构

```
src/mobile-rn/
├── android/              # Android 原生代码
├── ios/                  # iOS 原生代码
├── src/
│   ├── navigation/       # 导航配置
│   ├── screens/          # 页面组件
│   ├── services/         # API 服务
│   ├── utils/            # 工具函数
│   └── types/            # TypeScript 类型
├── App.tsx               # 应用入口
├── index.js              # 注册入口
└── package.json          # 依赖配置
```

## 开发建议

1. 使用 TypeScript 进行类型检查
2. 遵循 React Native 最佳实践
3. 使用 ESLint 和 Prettier 格式化代码
4. 定期更新依赖包

## 调试工具

- React Native Debugger
- Flipper
- Chrome DevTools

## 更多信息

查看 [README.md](./README.md) 了解更多功能说明。
