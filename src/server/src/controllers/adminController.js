import Hotel from '../models/Hotel.js';
import Audit from '../models/Audit.js';

// 获取待审核酒店列表
export const getPendingHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ 
      status: 'pending',
      isDeleted: false 
    })
    .populate('merchantId', 'username email phone')
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取所有酒店（管理员视图）
export const getAllHotels = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { isDeleted: false };
    
    if (status) query.status = status;

    const hotels = await Hotel.find(query)
      .populate('merchantId', 'username email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 审核通过
export const approveHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    const previousStatus = hotel.status;
    hotel.status = 'published';
    hotel.rejectReason = '';
    await hotel.save();

    // 记录审核日志
    await Audit.create({
      hotelId: hotel._id,
      operatorId: req.user.id,
      action: 'approve',
      previousStatus,
      newStatus: 'published'
    });

    res.json({
      success: true,
      message: '审核通过',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 审核驳回
export const rejectHotel = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: '请填写驳回原因' });
    }

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    const previousStatus = hotel.status;
    hotel.status = 'rejected';
    hotel.rejectReason = reason;
    await hotel.save();

    // 记录审核日志
    await Audit.create({
      hotelId: hotel._id,
      operatorId: req.user.id,
      action: 'reject',
      reason,
      previousStatus,
      newStatus: 'rejected'
    });

    res.json({
      success: true,
      message: '已驳回',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 下线酒店
export const offlineHotel = async (req, res) => {
  try {
    const { reason } = req.body;
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    const previousStatus = hotel.status;
    hotel.status = 'offline';
    hotel.isDeleted = true;
    hotel.offlineDate = new Date();
    hotel.offlineReason = reason || '管理员下线';
    await hotel.save({ validateBeforeSave: false });

    // 记录审核日志
    await Audit.create({
      hotelId: hotel._id,
      operatorId: req.user.id,
      action: 'offline',
      reason: hotel.offlineReason,
      previousStatus,
      newStatus: 'offline'
    });

    res.json({
      success: true,
      message: '已下线',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取下线酒店列表
export const getOfflineHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ 
      status: 'offline',
      isDeleted: true 
    })
    .populate('merchantId', 'username email phone')
    .sort({ offlineDate: -1 });

    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 恢复下线酒店
export const restoreHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: '酒店不存在' });
    }

    if (hotel.status !== 'offline') {
      return res.status(400).json({ message: '该酒店未下线' });
    }

    const previousStatus = hotel.status;
    hotel.status = 'published';
    hotel.isDeleted = false;
    hotel.offlineDate = null;
    hotel.offlineReason = null;
    await hotel.save({ validateBeforeSave: false });

    // 记录审核日志
    await Audit.create({
      hotelId: hotel._id,
      operatorId: req.user.id,
      action: 'restore',
      previousStatus,
      newStatus: 'published'
    });

    res.json({
      success: true,
      message: '已恢复上线',
      data: hotel
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取审核记录
export const getAuditLogs = async (req, res) => {
  try {
    const { hotelId } = req.params;

    const audits = await Audit.find({ hotelId })
      .populate('operatorId', 'username role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: audits
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
