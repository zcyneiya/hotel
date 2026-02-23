export type NearbyPoi = {
  name: string;
  distance?: string;
  location?: string;
};

export type NearbyGroup = {
  attractions: NearbyPoi[];
  transportation: NearbyPoi[];
  shopping: NearbyPoi[];
};

export const emptyNearbyGroup = (): NearbyGroup => ({
  attractions: [],
  transportation: [],
  shopping: [],
});

export const normalizePoiList = (list?: Array<NearbyPoi | string>): NearbyPoi[] => {
  if (!Array.isArray(list)) return [];
  return list
    .map((item) =>
      typeof item === 'string'
        ? { name: item }
        : {
            name: item?.name || '',
            distance: item?.distance,
            location: item?.location,
          }
    )
    .filter((item) => item.name);
};

export const normalizeNearbyGroup = (data?: Partial<NearbyGroup>): NearbyGroup => {
  return {
    attractions: normalizePoiList(data?.attractions),
    transportation: normalizePoiList(data?.transportation),
    shopping: normalizePoiList(data?.shopping),
  };
};

export const mapAmapPois = (list: any[]): NearbyPoi[] => {
  if (!Array.isArray(list)) return [];
  return list
    .map((p) => ({
      name: p?.name || '',
      distance: p?.distance,
      location: p?.location,
    }))
    .filter((item) => item.name);
};

export const formatDistance = (distance?: string) => {
  if (!distance) return '';
  const meters = Number(distance);
  if (Number.isNaN(meters)) return distance;
  if (meters < 1000) return `${meters}m`;
  return `${(meters / 1000).toFixed(1)}km`;
};
