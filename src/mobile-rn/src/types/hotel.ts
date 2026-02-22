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
  openDate: string;
  promotions?: promotion[];
  location?: {
    lat: number;
    lng: number;
  };
  reviews?: Review[];
  originalPrice?: number;
    nearby?: {
    attractions?: { name: string; distance?: string; type?: string }[];
    transportation?: { name: string; distance?: string; type?: string }[];
    shopping?: { name: string; distance?: string; type?: string }[];
  };

}

export interface promotion {
  title: string;
  description: string;
} 

export interface Room {
  type: string;
  price: number;
  area?: number;
  capacity: number;
  totalRooms: number;
  availableRooms: number;
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
