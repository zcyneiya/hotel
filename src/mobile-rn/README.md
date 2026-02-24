# Hotel Mobile App (React Native + Expo)

酒店预订移动端应用 - 基于 React Native 和 Expo 开发

## 技术栈

- React Native 0.81.x
- Expo SDK 54
- TypeScript
- React Navigation 6
- Axios
- 高德 JS API（地图渲染）
- Expo Location（首页定位）

## 项目结构

```
src/
├── screens/          # 页面组件
│   ├── HomeScreen.tsx        # 首页 - 酒店查询
│   ├── ListScreen.tsx        # 列表页 - 酒店列表
│   ├── DetailScreen.tsx      # 详情页 - 酒店详情
│   ├── MapScreen.tsx         # 地图页（App/真机）
│   └── MapScreen.web.tsx     # 地图页（Web）
├── navigation/       # 导航配置
│   └── AppNavigator.tsx
├── services/         # API 服务
│   ├── hotelService.ts
│   └── poiService.ts
├── types/           # TypeScript 类型定义
│   ├── hotel.ts
│   └── navigation.ts
├── components/      # 公共组件
│   ├── common/
│   │   └── Skeleton.tsx      # 骨架屏（轻量版）
│   ├── detail/
│   │   ├── MapButton.tsx     # 地图按钮
│   │   └── NearbySection.tsx # 周边信息模块
│   ├── home/
│   └── list/
├── constants/       # 常量配置
│   └── theme.ts
├── hooks/
│   └── useNearbyPoi.ts       # 周边数据处理
└── utils/          # 工具函数
    └── poi.ts               # 周边工具方法
```

## 已实现功能

### 1. 首页 (HomeScreen)
- ✅ Banner 轮播 - 点击跳转酒店详情页
- ✅ 定位功能 - 获取当前城市
- ✅ 目的地搜索
- ✅ 关键字搜索
- ✅ 日期选择
- ✅ 快捷标签筛选（亲子、豪华等）
- ✅ 热门目的地展示
- ✅ 骨架屏

### 2. 列表页 (ListScreen)
- ✅ 显示查询信息（城市、日期等）
- ✅ 酒店卡片展示
- ✅ 价格显示（最低价 + "起"字）
- ✅ 上滑自动加载更多
- ✅ 下拉刷新
- ✅ 筛选功能（价格、评分、设施下拉选择）
- ✅ 回到顶部按钮
- ✅ 骨架屏

### 3. 详情页 (DetailScreen)
- ✅ 图片轮播展示
- ✅ 酒店基本信息
- ✅ 开业时间显示
- ✅ 附近景点、交通、商场
- ✅ 选择日历、人数、间数 Banner
- ✅ 设施与服务
- ✅ 房型列表（从低到高排序）
- ✅ 房间数量提示（少于3间时提示）
- ✅ 住客评价区（Mock 数据）
- ✅ 地图入口
- ✅ 回到顶部按钮
- ✅ 骨架屏

### 4. 地图页 (MapScreen)
- ✅ 高德 JS 地图展示（App 使用 WebView，Web 端直接加载 JS）
- ✅ 酒店位置 + 周边 POI 标记
- ✅ 交通 / 景点 / 商场分类切换
- ✅ 周边列表与地图联动
- ✅ 可拖拽信息卡片

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

修改 `src/config.ts` 中的 API 地址：

```typescript
export const BASE_URL = 'http://your-api-url:3000';
export const API_URL = `${BASE_URL}/api`;
```

## 环境变量

移动端地图使用高德 JS API Key：

```
# src/mobile-rn/.env
EXPO_PUBLIC_AMAP_JS_KEY=你的高德JS Key
EXPO_PUBLIC_AMAP_JS_SECURITY_CODE=你的高德安全密钥
```

真机调试时，请把 `BASE_URL` 改成电脑局域网 IP（如 `http://192.168.1.8:3000`）。

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
  openDate: string;
  promotions?: Promotion[];
  nearby?: {
    attractions?: { name: string; distance?: string }[];
    transportation?: { name: string; distance?: string }[];
    shopping?: { name: string; distance?: string }[];
  };
  location?: { lat: number; lng: number };
  reviews?: Review[];
  originalPrice?: number;
}
```

interface Promotion {
  title: string;
  description: string;
}

### Room 类型
```typescript
interface Room {
  type: string;
  price: number;
  area?: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
  facilities: string[];
}
```

## 注意事项

1. 需要配置后端 API 地址
2. 真机调试请使用电脑局域网 IP
3. iOS 需要在 Info.plist 中配置位置权限
4. Android 需要在 AndroidManifest.xml 中配置位置权限
5. 图片资源使用在线 URL，确保网络连接

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
