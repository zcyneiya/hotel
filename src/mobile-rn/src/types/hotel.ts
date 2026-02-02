export interface Hotel {
  _id: string;
  name: {
    cn?: string;
    en?: string;
  } | string;
  address: string;
  city: string;
  starLevel: number;
  type: string;
  rating: number;
  images: string[];
  facilities: string[];
  rooms: Room[];
  originalPrice?: number;
}

export interface Room {
  type: string;
  price: number;
  area?: number;
  facilities: string[];
  available: boolean;
}

export interface HotelListParams {
  city?: string;
  keyword?: string;
  checkIn?: string;
  checkOut?: string;
  starLevel?: string;
  priceRange?: string;
  tags?: string;
  page?: number;
  limit?: number;
}

export interface HotelListResponse {
  success: boolean;
  data: {
    hotels: Hotel[];
    pagination: {
      page: number;
      pages: number;
      total: number;
    };
  };
}

export interface HotelDetailResponse {
  success: boolean;
  data: Hotel;
}
