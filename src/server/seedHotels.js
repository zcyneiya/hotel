import mongoose from 'mongoose';
import Hotel from './src/models/Hotel.js';
import connectDB from './src/config/database.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockHotels = [
  {
    name: { cn: '北京王府井希尔顿酒店', en: 'Hilton Beijing Wangfujing' },
    address: '北京市东城区王府井东街8号',
    city: '北京',
    starLevel: 5,
    description: '位于繁华的王府井商圈，距离故宫仅几步之遥，提供豪华住宿体验。',
    openDate: new Date('2010-01-01'),
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '游泳池', '健身房', '餐厅', '会议室'],
    rooms: [
      { type: '豪华大床房', price: 1288, capacity: 2, totalRooms: 10, availableRooms: 10, facilities: ['浴缸', '落地窗'] },
      { type: '行政套房', price: 2188, capacity: 2, totalRooms: 5, availableRooms: 5, facilities: ['客厅', '行政酒廊'] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '北京胡同四合院客栈', en: 'Beijing Hutong Courtyard Inn' },
    address: '北京市西城区鼓楼西大街',
    city: '北京',
    starLevel: 3,
    description: '体验老北京胡同文化，传统四合院建筑，温馨舒适。',
    openDate: new Date('2015-05-01'),
    images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '餐厅', '花园'],
    rooms: [
      { type: '舒适大床房', price: 450, capacity: 2, totalRooms: 8, availableRooms: 8, facilities: [] },
      { type: '家庭房', price: 680, capacity: 3, totalRooms: 4, availableRooms: 4, facilities: [] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '上海外滩华尔道夫酒店', en: 'Waldorf Astoria Shanghai on the Bund' },
    address: '上海市黄浦区中山东一路2号',
    city: '上海',
    starLevel: 5,
    description: '坐拥外滩绝美江景，融合历史建筑与现代奢华。',
    openDate: new Date('2011-03-15'),
    images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '停车场', '游泳池', '健身房', '餐厅', '酒吧'],
    rooms: [
      { type: '外滩江景房', price: 2888, capacity: 2, totalRooms: 15, availableRooms: 15, facilities: ['江景', '浴缸'] },
      { type: '豪华套房', price: 4588, capacity: 2, totalRooms: 5, availableRooms: 5, facilities: ['客厅', '江景'] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '上海法租界老洋房民宿', en: 'Shanghai French Concession Villa' },
    address: '上海市徐汇区武康路',
    city: '上海',
    starLevel: 4,
    description: '梧桐树下的老洋房，感受上海滩的小资情调。',
    openDate: new Date('2018-09-10'),
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '厨房', '露台'],
    rooms: [
      { type: '花园景观房', price: 880, capacity: 2, totalRooms: 3, availableRooms: 3, facilities: ['阳台'] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '杭州西子湖四季酒店', en: 'Four Seasons Hotel Hangzhou at West Lake' },
    address: '杭州市西湖区灵隐路5号',
    city: '杭州',
    starLevel: 5,
    description: '隐匿于西湖畔的江南园林风格酒店，尽享静谧与奢华。',
    openDate: new Date('2012-10-01'),
    images: ['https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '停车场', '游泳池', 'SPA', '餐厅', '茶室'],
    rooms: [
      { type: '园林客房', price: 3288, capacity: 2, totalRooms: 12, availableRooms: 12, facilities: ['庭院景观'] },
      { type: '湖景别墅', price: 8888, capacity: 4, totalRooms: 2, availableRooms: 2, facilities: ['私人泳池', '厨房'] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '杭州满觉陇民宿', en: 'Hangzhou Manjuelong Guesthouse' },
    address: '杭州市西湖风景区满觉陇路',
    city: '杭州',
    starLevel: 3,
    description: '桂花飘香的季节，来这里感受杭州的慢生活。',
    openDate: new Date('2016-08-20'),
    images: ['https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '餐厅'],
    rooms: [
      { type: '山景大床房', price: 580, capacity: 2, totalRooms: 6, availableRooms: 6, facilities: ['落地窗'] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '成都博舍酒店', en: 'The Temple House Chengdu' },
    address: '成都市锦江区太古里',
    city: '成都',
    starLevel: 5,
    description: '融合传统川式建筑与现代设计，位于太古里核心地带。',
    openDate: new Date('2015-06-01'),
    images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '游泳池', '健身房', 'SPA', '酒吧'],
    rooms: [
      { type: '博舍开间', price: 1988, capacity: 2, totalRooms: 20, availableRooms: 20, facilities: [] },
      { type: '豪华套房', price: 3288, capacity: 2, totalRooms: 8, availableRooms: 8, facilities: [] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  },
  {
    name: { cn: '成都宽窄巷子客栈', en: 'Kuan Zhai Alley Inn' },
    address: '成都市青羊区宽窄巷子',
    city: '成都',
    starLevel: 4,
    description: '住在宽窄巷子旁，出门即是美食与茶馆。',
    openDate: new Date('2017-03-30'),
    images: ['https://images.unsplash.com/photo-1521783988139-89397d761dce?w=800&h=600&fit=crop'],
    facilities: ['免费WiFi', '茶室'],
    rooms: [
      { type: '特色大床房', price: 680, capacity: 2, totalRooms: 5, availableRooms: 5, facilities: [] }
    ],
    status: 'published',
    isDeleted: false,
    merchantId: new mongoose.Types.ObjectId()
  }
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('Database connected');

    // 清除这几个城市的测试数据 (可选，避免重复添加)
    await Hotel.deleteMany({ city: { $in: ['北京', '上海', '杭州', '成都'] } });

    
    // 为所有mock数据添加随机的 merchantId (在实际应用中应该关联真实用户)
    const hotelsWithIds = mockHotels.map(hotel => ({
        ...hotel,
        merchantId: new mongoose.Types.ObjectId()
    }));
    
    await Hotel.insertMany(hotelsWithIds);

    console.log('Mock data imported successfully');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

seedData();
