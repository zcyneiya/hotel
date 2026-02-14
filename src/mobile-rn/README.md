# Hotel Mobile App (React Native + Expo)

酒店预订移动端应用 - 基于 React Native 和 Expo 开发

## 技术栈

- React Native 0.76.5
- Expo ~52.0.0
- TypeScript
- React Navigation 6
- Axios
- Expo Location

## 项目结构

```
src/
├── screens/          # 页面组件
│   ├── HomeScreen.tsx       # 首页 - 酒店查询
│   ├── ListScreen.tsx       # 列表页 - 酒店列表
│   └── DetailScreen.tsx     # 详情页 - 酒店详情
├── navigation/       # 导航配置
│   └── AppNavigator.tsx
├── services/         # API 服务
│   └── hotelService.ts
├── types/           # TypeScript 类型定义
│   ├── hotel.ts
│   └── navigation.ts
├── components/      # 公共组件
├── constants/       # 常量配置
│   └── theme.ts
└── utils/          # 工具函数
```

## 已实现功能

### 1. 首页 (HomeScreen)
- ✅ Banner 轮播 - 点击跳转酒店详情页
- ✅ 定位功能 - 获取当前城市
- ✅ 目的地搜索
- ✅ 关键字搜索
- ✅ 日期选择（UI 已完成，待实现日历组件）
- ✅ 快捷标签筛选（亲子、豪华等）
- ✅ 热门目的地展示

### 2. 列表页 (ListScreen)
- ✅ 显示查询信息（城市、日期等）
- ✅ 酒店卡片展示
- ✅ 显示附近景点、交通、商场
- ✅ 价格显示（最低价 + "起"字）
- ✅ 上滑自动加载更多
- ✅ 下拉刷新
- ⏳ 筛选功能（价格、评分、设施下拉选择）

### 3. 详情页 (DetailScreen)
- ✅ 图片轮播展示
- ✅ 酒店基本信息
- ✅ 开业时间显示
- ✅ 附近景点、交通、商场
- ✅ 选择日历、人数、间数 Banner（UI 已完成）
- ✅ 设施与服务
- ✅ 房型列表（从低到高排序）
- ✅ 房间数量提示（少于3间时提示）
- ✅ 住客评价区（Mock 数据）
- ⏳ 地图显示（可选）

## 待完成功能

### 高优先级
1. 日历组件实现（入住/离店日期选择）
2. 筛选功能完善（价格、评分、设施下拉选择）
3. 详情页日历、人数、间数选择功能
4. 与后端 API 对接

### 中优先级
1. 地图显示功能
2. 收藏功能实现
3. 预订流程完善
4. 用户登录/注册

### 低优先级
1. 搜索历史
2. 分享功能
3. 优惠券/折扣展示

## 安装依赖

```bash
cd src/mobile-rn
npm install
```

## 运行项目

```bash
# 启动开发服务器
npm start

# 在 iOS 模拟器运行
npm run ios

# 在 Android 模拟器运行
npm run android

# 在浏览器运行
npm run web
```

## API 配置

修改 `src/services/hotelService.ts` 中的 API 地址：

```typescript
const API_BASE_URL = 'http://your-api-url:3000/api';
```

## 数据结构

### Hotel 类型
```typescript
interface Hotel {
  _id: string;
  name: { cn: string; en: string } | string;
  address: string;
  city: string;
  starLevel: number;
  type: string;
  rating: number;
  images: string[];
  facilities: string[];
  rooms: Room[];
  nearbyAttractions?: string[];
  nearbyTransport?: string[];
  nearbyMalls?: string[];
  openingDate?: string;
  location?: { lat: number; lng: number };
  reviews?: Review[];
  originalPrice?: number;
}
```

### Room 类型
```typescript
interface Room {
  type: string;
  price: number;
  area?: number;
  capacity: number;
  count: number;
  availableCount: number;
  facilities: string[];
}
```

## 注意事项

1. 需要配置后端 API 地址
2. iOS 需要在 Info.plist 中配置位置权限
3. Android 需要在 AndroidManifest.xml 中配置位置权限
4. 图片资源使用在线 URL，确保网络连接

## 开发规范

- 使用 TypeScript 进行类型检查
- 遵循 React Hooks 最佳实践
- 组件拆分遵循单一职责原则
- 样式使用 StyleSheet.create
- 异步操作使用 async/await

## 相关文档

- [React Native 文档](https://reactnative.dev/)
- [Expo 文档](https://docs.expo.dev/)
- [React Navigation 文档](https://reactnavigation.org/)
