import Hotel from '../models/Hotel.js';
import Audit from '../models/Audit.js';

// 转换 nearby 数据为移动端格式
const transformNearbyData = (hotel) => {
  //因为要添加 Schema 外的新字段，所以先转换为普通对象
  const hotelObj = hotel.toObject ? hotel.toObject() : hotel;

  // 如果有 nearby 对象，转换为移动端需要的格式
  if (hotelObj.nearby) {
    hotelObj.nearbyAttractions = hotelObj.nearby.attractions?.map(a => a.name) || [];
    hotelObj.nearbyTransport = hotelObj.nearby.transportation?.map(t => t.name) || [];
    hotelObj.nearbyMalls = hotelObj.nearby.shopping?.map(s => s.name) || [];
  }

  return hotelObj;
};

// 创建酒店
export const createHotel = async (req, res) => {
  try {
    const normalizeLocation = (loc) => {
      if (!loc) return undefined;
      const lng = Number(loc.lng);
      const lat = Number(loc.lat);
      return Number.isFinite(lng) && Number.isFinite(lat) ? { lng, lat } : undefined;
    };

    const hotelData = {
      ...req.body,
      location: normalizeLocation(req.body.location),
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
    let { city, keyword, starLevel, minPrice, maxPrice, priceRange, rating, facilities, page = 1, limit = 10 } = req.query;

    console.log('收到查询参数:', req.query);

    // 解析 priceRange 参数
    if (priceRange) {
      if (priceRange === '1000-') {
        minPrice = 1000;
        maxPrice = undefined;
      } else {
        const parts = priceRange.split('-');
        if (parts.length === 2) {
          minPrice = parseInt(parts[0]);
          maxPrice = parseInt(parts[1]);
        }
      }
    } else {
      if (req.query.minPrice !== undefined) minPrice = parseInt(req.query.minPrice);
      if (req.query.maxPrice !== undefined) maxPrice = parseInt(req.query.maxPrice);
    }

    // 解析 facilities 参数
    let facilitiesList = [];
    if (facilities) {
      facilitiesList = facilities.split(',').filter(f => f);
    }

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

    if (starLevel && starLevel !== 'undefined' && !isNaN(parseInt(starLevel))) {
      query.starLevel = parseInt(starLevel);
    }

    // 关键字搜索，多字段模糊搜索
    if (keyword && keyword !== 'undefined') {
      // 使用正则表达式进行模糊搜索，$options: 'i'表示忽略大小写
      const keywordRegex = { $regex: keyword, $options: 'i' };
      //$or操作符允许在多个字段中进行模糊搜索
      query.$or = [
        { 'name.cn': keywordRegex },
        { 'name.en': keywordRegex },
        { address: keywordRegex }
      ];
    }

    // 价格区间筛选
    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceQuery = {};
      if (minPrice !== undefined && !isNaN(minPrice)) priceQuery.$gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) priceQuery.$lte = maxPrice;

      if (Object.keys(priceQuery).length > 0) {
        //$elemMatch 是 MongoDB 的数组查询操作符，用于匹配数组中至少有一个元素满足所有指定条件。
        query.rooms = { $elemMatch: { price: priceQuery } };
      }
    }

    // 设施筛选 (包含所有选中的设施)
    if (facilitiesList.length > 0) {
      query.facilities = { $all: facilitiesList };
    }

    // 评分筛选
    if (rating) {
      const ratingNum = parseFloat(rating);
      if (!isNaN(ratingNum)) {
        query.rating = { $gte: ratingNum };
      }
    }

    //console.log('解码后的城市:', city);
    //console.log('MongoDB 查询条件:', JSON.stringify(query, null, 2));

    const hotels = await Hotel.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    //console.log('查询结果数量:', hotels.length);

    const total = await Hotel.countDocuments(query);

    // 转换数据格式
    const transformedHotels = hotels.map(hotel => transformNearbyData(hotel));

    res.json({
      success: true,
      data: {
        hotels: transformedHotels,
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

    // 转换数据格式
    const transformedHotel = transformNearbyData(hotel);

    res.json({
      success: true,
      data: transformedHotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
