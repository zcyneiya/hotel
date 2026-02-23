export type RootStackParamList = {
  Home: undefined;
  List: {
    city?: string;
    keyword?: string;
    checkIn?: string;
    checkOut?: string;
    starLevel?: string;
    priceRange?: string;
    tags?: string;
  };
  Detail: {
    id: string;
  };
  Map: {
    hotelId: string;
    hotelName: string;
    address: string;
    city?: string;
    location?: {
      lat: number;
      lng: number;
    };
    nearby?: {
      attractions?: { name: string; distance?: string; location?: string }[];
      transportation?: { name: string; distance?: string; location?: string }[];
      shopping?: { name: string; distance?: string; location?: string }[];
    };
  };
};
