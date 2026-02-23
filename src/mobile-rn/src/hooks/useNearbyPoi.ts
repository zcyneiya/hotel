import { useEffect, useMemo, useRef, useState } from 'react';
import { poiService } from '../services/poiService';
import {
  emptyNearbyGroup,
  mapAmapPois,
  normalizeNearbyGroup,
  type NearbyGroup,
} from '../utils/poi';

interface UseNearbyPoiOptions {
  initialNearby?: Partial<NearbyGroup>;
  location?: { lat: number; lng: number } | null;
  autoFetch?: boolean;
}

export const useNearbyPoi = ({
  initialNearby,
  location,
  autoFetch = true,
}: UseNearbyPoiOptions) => {
  const normalizedInitial = useMemo(
    () => normalizeNearbyGroup(initialNearby),
    [initialNearby]
  );
  const hasInitialNearby = useMemo(() => {
    return (
      normalizedInitial.attractions.length > 0 ||
      normalizedInitial.transportation.length > 0 ||
      normalizedInitial.shopping.length > 0
    );
  }, [normalizedInitial]);

  const [autoNearby, setAutoNearby] = useState<NearbyGroup>(
    emptyNearbyGroup()
  );
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoError, setAutoError] = useState(false);
  const autoTriedRef = useRef(false);

  useEffect(() => {
    if (!autoFetch || hasInitialNearby) return;
    if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) {
      return;
    }
    if (autoTriedRef.current) return;

    autoTriedRef.current = true;
    setAutoLoading(true);
    setAutoError(false);

    const locationStr = `${location.lng},${location.lat}`;

    Promise.all([
      poiService.around(locationStr, '110000'),
      poiService.around(locationStr, '150000'),
      poiService.around(locationStr, '060000'),
    ])
      .then(([scenicRes, transportRes, mallRes]) => {
        setAutoNearby({
          attractions: mapAmapPois(scenicRes?.data?.pois || []).slice(0, 20),
          transportation: mapAmapPois(transportRes?.data?.pois || []).slice(0, 20),
          shopping: mapAmapPois(mallRes?.data?.pois || []).slice(0, 20),
        });
      })
      .catch(() => {
        setAutoError(true);
      })
      .finally(() => {
        setAutoLoading(false);
      });
  }, [autoFetch, hasInitialNearby, location?.lat, location?.lng]);

  const effectiveNearby = hasInitialNearby ? normalizedInitial : autoNearby;

  return {
    effectiveNearby,
    hasInitialNearby,
    autoLoading,
    autoError,
  };
};
