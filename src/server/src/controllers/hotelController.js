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
    const { city, keyword, starLevel, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = { status: 'published', isDeleted: false };

    // 城市模糊搜索（支持"武汉"、"武汉市"等）
    if (city) {
      query.city = { $regex: city.replace(/市$/, ''), $options: 'i' };
    }
    
    if (starLevel) query.starLevel = parseInt(starLevel);
    if (keyword) query['name.cn'] = { $regex: keyword, $options: 'i' };

    const hotels = await Hotel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

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
    res.status(500).json({ message: error.message });
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
