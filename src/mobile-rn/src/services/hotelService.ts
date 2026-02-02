import request from '../utils/request';
import {HotelListParams, HotelListResponse, HotelDetailResponse} from '../types/hotel';

export const hotelService = {
  // 获取酒店列表
  getHotels: (params: HotelListParams): Promise<HotelListResponse> => {
    return request.get('/hotels', {params});
  },

  // 获取酒店详情
  getHotelById: (id: string): Promise<HotelDetailResponse> => {
    return request.get(`/hotels/${id}`);
  },
};
