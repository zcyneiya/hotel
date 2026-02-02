import Hotel from '../models/Hotel.js';
import Audit from '../models/Audit.js';

// 创建酒店
export const createHotel = async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      merchantId: req.user.id,
      status: 'draft'
    };

    const hotel = new Hotel(hotelData);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: '酒店创建成功',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取酒店列表（用户端）
export const getHotels = async (req, res) => {
  try {
    let { city, keyword, starLevel, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    console.log('收到查询参数:', req.query);

    // 解码 URL 编码的参数
    if (city) {
      try {
        city = decodeURIComponent(city);
      } catch (e) {
        console.log('城市参数解码失败，使用原值');
      }
    }

    const query = { status: 'published', isDeleted: false };

    // 城市模糊搜索（支持"武汉"、"武汉市"等）
    if (city && city !== 'undefined') {
      query.city = { $regex: city.replace(/市$/, ''), $options: 'i' };
    }
    
    // 星级筛选（只有有效数字才添加）
    if (starLevel && starLevel !== 'undefined' && !isNaN(parseInt(starLevel))) {
      query.starLevel = parseInt(starLevel);
    }
    
    // 关键字搜索
    if (keyword && keyword !== 'undefined') {
      query['name.cn'] = { $regex: keyword, $options: 'i' };
    }

    console.log('解码后的城市:', city);
    console.log('MongoDB 查询条件:', JSON.stringify(query, null, 2));

    const hotels = await Hotel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    console.log('查询结果数量:', hotels.length);

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('查询酒店失败:', error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// 获取酒店详情
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel || hotel.isDeleted) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    res.json({
      success: true,
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
