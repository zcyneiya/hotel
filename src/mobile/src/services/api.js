import request from '../utils/request';

export const hotelService = {
  // 获取酒店列表
  getHotels: (params) => request('/hotels', { data: params }),
  
  // 获取酒店详情
  getHotelById: (id) => request(`/hotels/${id}`)
};
