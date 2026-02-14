export interface Hotel {
  _id: string;
  name: {
    cn: string;
    en: string;
  } | string;
  address: string;
  city: string;
  starLevel: number;
  type: string;
  rating: number;
  images: string[];
  facilities: string[];
  rooms: Room[];
  nearbyAttractions?: string[];
  nearbyTransport?: string[];
  nearbyMalls?: string[];
  openingDate?: string;
  location?: {
    lat: number;
    lng: number;
  };
  reviews?: Review[];
  originalPrice?: number;
}

export interface Room {
  type: string;
  price: number;
  area?: number;
  capacity: number;
  count: number;
  availableCount: number;
  facilities: string[];
}

export interface Review {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  content: string;
  date: string;
  images?: string[];
}

export interface SearchParams {
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
