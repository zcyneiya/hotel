import api from '../utils/request';

// 认证服务
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

// 酒店服务
export const hotelService = {
  getHotels: (params) => api.get('/hotels', { params }),
  getHotelById: (id) => api.get(`/hotels/${id}`),
  createHotel: (data) => api.post('/hotels', data),
  updateHotel: (id, data) => api.put(`/hotels/${id}`, data),
  getMerchantHotels: () => api.get('/hotels/merchant/my'),
  submitForReview: (id) => api.post(`/hotels/${id}/submit`),
  uploadImage: (formData) => api.post('/upload/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  // 更新房型价格 data: { roomId: string, price: number }
  updateRoomPrice: (id, data) => api.put(`/hotels/${id}/room-price`, data),
  // 促销活动相关接口
  createPromotion: (id, data) => api.post(`/hotels/${id}/promotions`, data),
  updatePromotion: (hotelId, promoId, data) => api.put(`/hotels/${hotelId}/promotions/${promoId}`, data)
};

// 审核服务
export const auditService = {
  getPendingHotels: () => api.get('/audits/hotels/pending'),
  getAllHotels: (params) => api.get('/audits/hotels', { params }),
  getOfflineHotels: () => api.get('/audits/hotels/offline'),
  approveHotel: (id) => api.post(`/audits/hotels/${id}/approve`),
  rejectHotel: (id, reason) => api.post(`/audits/hotels/${id}/reject`, { reason }),
  offlineHotel: (id, data) => api.post(`/audits/hotels/${id}/offline`, data),
  restoreHotel: (id) => api.post(`/audits/hotels/${id}/restore`),
  getAuditLogs: (hotelId) => api.get(`/audits/hotels/${hotelId}/logs`)
};

// 商户端地图选址周边推荐
// params: { location: 'lng,lat', types: '110000|150000|060000', radius?: number }
export const poiService = {
  getAround: (params) => api.get('/poi/around', { params })
};

