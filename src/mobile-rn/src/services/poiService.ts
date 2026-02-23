import axios from 'axios';
import { API_URL } from '../config';

const poiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

export const poiService = {
  geocode: async (address: string, city?: string) => {
    const response = await poiClient.get('/poi/geocode', {
      params: { address, city },
    });
    return response.data;
  },
  around: async (location: string, types: string, radius = 2000) => {
    const response = await poiClient.get('/poi/around', {
      params: { location, types, radius },
    });
    return response.data;
  },
};
