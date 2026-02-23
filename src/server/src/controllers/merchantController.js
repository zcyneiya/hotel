import Hotel from '../models/Hotel.js';
import Audit from '../models/Audit.js';

// 获取商户的酒店列表
export const getMerchantHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ 
      merchantId: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新酒店信息
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      merchantId: req.user.id
    });

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在或无权限' });
    }

    if (req.body.location) {
      const lng = Number(req.body.location.lng);
      const lat = Number(req.body.location.lat);
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        req.body.location = { lng, lat };
      } else {
        delete req.body.location; 
      }
    }

    Object.assign(hotel, req.body);
    await hotel.save();

    res.json({
      success: true,
      message: '更新成功',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 提交审核
export const submitForReview = async (req, res) => {
  try {
    const hotel = await Hotel.findOne({
      _id: req.params.id,
      merchantId: req.user.id
    });

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在或无权限' });
    }

    hotel.status = 'pending';
    await hotel.save();

    // 记录审核日志
    await Audit.create({
      hotelId: hotel._id,
      operatorId: req.user.id,
      action: 'submit',
      previousStatus: 'draft',
      newStatus: 'pending'
    });

    res.json({
      success: true,
      message: '已提交审核',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
