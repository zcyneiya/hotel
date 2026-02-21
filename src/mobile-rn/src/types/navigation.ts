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
};
