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
  submitForReview: (id) => api.post(`/hotels/${id}/submit`)
};

// 审核服务
export const auditService = {
  getPendingHotels: () => api.get('/audits/hotels/pending'),
  getAllHotels: (params) => api.get('/audits/hotels', { params }),
  approveHotel: (id) => api.post(`/audits/hotels/${id}/approve`),
  rejectHotel: (id, reason) => api.post(`/audits/hotels/${id}/reject`, { reason }),
  offlineHotel: (id) => api.post(`/audits/hotels/${id}/offline`),
  getAuditLogs: (hotelId) => api.get(`/audits/hotels/${hotelId}/logs`)
};
