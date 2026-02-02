# Taro 到 React Native 迁移对比

## 概述

本文档记录了从 Taro 3.x 框架迁移到 React Native 0.73+ 的详细对比和变更说明。

## 框架对比

| 特性 | Taro 3.x | React Native 0.73+ |
|------|----------|-------------------|
| **目标平台** | 微信小程序、H5、支付宝等 | iOS、Android 原生应用 |
| **开发语言** | JavaScript/TypeScript | TypeScript (推荐) |
| **组件库** | Taro Components | React Native Components |
| **样式方案** | SCSS/CSS | StyleSheet API |
| **导航方案** | Taro.navigateTo | React Navigation |
| **网络请求** | Taro.request | Axios |
| **状态管理** | React Hooks | React Hooks |
| **构建工具** | Webpack | Metro Bundler |

## 组件映射

### 基础组件

| Taro | React Native | 说明 |
|------|--------------|------|
| `View` | `View` | 容器组件 |
| `Text` | `Text` | 文本组件 |
| `Image` | `Image` | 图片组件 |
| `ScrollView` | `ScrollView` | 滚动容器 |
| `Swiper` | `ScrollView` (horizontal + pagingEnabled) | 轮播组件 |
| `Input` | `TextInput` | 输入框 |
| `Button` | `TouchableOpacity` + `Text` | 按钮 |
| `Picker` | 第三方库或自定义 | 选择器 |

### 导航 API

| Taro | React Native |
|------|--------------|
| `Taro.navigateTo()` | `navigation.navigate()` |
| `Taro.navigateBack()` | `navigation.goBack()` |
| `Taro.redirectTo()` | `navigation.replace()` |
| `Taro.getCurrentInstance()` | `useRoute()` hook |

### 交互 API

| Taro | React Native |
|------|--------------|
| `Taro.showToast()` | `Alert.alert()` |
| `Taro.showLoading()` | `ActivityIndicator` |
| `Taro.getLocation()` | `@react-native-community/geolocation` |

## 样式迁移

### Taro (SCSS)
```scss
.hotel-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  
  .hotel-name {
    font-size: 18px;
    font-weight: bold;
    color: #333;
  }
}
```

### React Native (StyleSheet)
```typescript
const styles = StyleSheet.create({
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
});
```

### 主要差异
- 不支持嵌套选择器
- 使用驼峰命名（camelCase）
- 数值单位默认为 dp/pt（无需 px）
- 不支持伪类（:hover, :active）
- 使用 flexbox 布局（默认 column）

## 页面迁移详情

### 1. 首页 (HomeScreen)

#### 功能保持一致
- ✅ Banner 轮播广告
- ✅ 搜索表单（目的地、关键字、日期）
- ✅ 快捷标签筛选
- ✅ 热门目的地推荐

#### 主要变更
- `Swiper` → `ScrollView` (horizontal + pagingEnabled)
- `Picker` → `TouchableOpacity` (日期选择待实现)
- `Taro.navigateTo` → `navigation.navigate`
- SCSS → StyleSheet

### 2. 列表页 (ListScreen)

#### 功能保持一致
- ✅ 酒店列表展示
- ✅ 下拉刷新
- ✅ 上拉加载更多
- ✅ 顶部筛选栏
- ✅ 收藏功能

#### 主要变更
- `ScrollView` → `FlatList` (性能优化)
- `onScrollToLower` → `onEndReached`
- 路由参数获取方式改变

### 3. 详情页 (DetailScreen)

#### 功能保持一致
- ✅ 图片轮播
- ✅ 酒店基本信息
- ✅ 设施服务列表
- ✅ 房型列表及价格
- ✅ 预订功能

#### 主要变更
- 图片轮播实现方式
- 返回按钮位置调整
- 滚动容器优化

## API 服务迁移

### Taro 版本
```javascript
import Taro from '@tarojs/taro';

const request = (url, options = {}) => {
  return Taro.request({
    url: BASE_URL + url,
    method: options.method || 'GET',
    data: options.data,
  });
};
```

### React Native 版本
```typescript
import axios from 'axios';

class Request {
  private instance: AxiosInstance;
  
  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
    });
  }
  
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, config);
  }
}
```

## 项目结构对比

### Taro 版本
```
src/mobile/
├── config/
├── src/
│   ├── pages/
│   │   ├── index/
│   │   ├── list/
│   │   └── detail/
│   ├── services/
│   ├── utils/
│   └── app.jsx
└── package.json
```

### React Native 版本
```
src/mobile-rn/
├── android/
├── ios/
├── src/
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── ListScreen.tsx
│   │   └── DetailScreen.tsx
│   ├── navigation/
│   ├── services/
│   ├── utils/
│   └── types/
├── App.tsx
├── index.js
└── package.json
```

## 待优化功能

### 高优先级
- [ ] 日期选择器组件（使用 @react-native-community/datetimepicker）
- [ ] 筛选功能完善（价格、评分、设施）
- [ ] 图片懒加载优化
- [ ] 错误边界处理

### 中优先级
- [ ] 地图定位功能
- [ ] 用户登录/注册
- [ ] 收藏功能持久化
- [ ] 搜索历史记录

### 低优先级
- [ ] 支付功能集成
- [ ] 分享功能
- [ ] 推送通知
- [ ] 离线缓存

## 性能优化建议

1. **图片优化**
   - 使用 FastImage 替代 Image
   - 实现图片懒加载
   - 压缩图片资源

2. **列表优化**
   - 使用 FlatList 的 getItemLayout
   - 实现虚拟列表
   - 优化 renderItem 性能

3. **导航优化**
   - 启用屏幕预加载
   - 使用 React.memo 减少重渲染
   - 优化动画性能

4. **网络优化**
   - 实现请求缓存
   - 添加请求重试机制
   - 优化并发请求

## 开发体验对比

### Taro 优势
- ✅ 一次开发，多端运行
- ✅ 学习成本低（类似 React）
- ✅ 微信小程序生态完善

### React Native 优势
- ✅ 原生性能更好
- ✅ 社区生态丰富
- ✅ 调试工具强大
- ✅ 支持热更新（CodePush）
- ✅ 更接近原生开发体验

## 总结

迁移工作已完成核心功能的实现，两个版本可以并行维护：
- **Taro 版本**：适用于微信小程序、H5 等轻量级场景
- **React Native 版本**：适用于 iOS、Android 原生应用，性能要求更高的场景

建议根据实际业务需求选择合适的技术栈。
