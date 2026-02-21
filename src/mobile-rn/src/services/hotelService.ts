import axios from 'axios';
import { SearchParams } from '../types/hotel';
import { API_URL } from '../config';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hotelService = {
  getHotels: async (params: SearchParams) => {
    const response = await apiClient.get('/hotels', { params });
    return response.data;
  },

  getHotelById: async (id: string) => {
    const response = await apiClient.get(`/hotels/${id}`);
    return response.data;
  },

  searchHotels: async (keyword: string) => {
    const response = await apiClient.get('/hotels/search', {
      params: { keyword },
    });
    return response.data;
  },
};

export default apiClient;
