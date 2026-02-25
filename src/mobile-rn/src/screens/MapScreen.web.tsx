import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AMAP_JS_KEY, AMAP_JS_SECURITY_CODE } from '../config';
import { poiService } from '../services/poiService';
import { useNearbyPoi } from '../hooks/useNearbyPoi';
import { formatDistance } from '../utils/poi';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_ZOOM = 15;
const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FALLBACK_MAX_HEIGHT = Math.round(SCREEN_HEIGHT * 0.9);
const FALLBACK_MIN_HEIGHT = Math.round(SCREEN_HEIGHT * 0.15);
const FALLBACK_MID_HEIGHT = Math.round(
  (FALLBACK_MAX_HEIGHT + FALLBACK_MIN_HEIGHT) / 2
);

type MapRouteProp = RouteProp<RootStackParamList, 'Map'>;
type MapNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Map'>;

type CategoryKey = 'transportation' | 'attractions' | 'shopping';

const TAB_OPTIONS: { key: CategoryKey; label: string }[] = [
  { key: 'transportation', label: '交通' },
  { key: 'attractions', label: '景点' },
  { key: 'shopping', label: '商场' },
];

const loadAmap = (key: string, securityCode?: string) => {
  const w = globalThis as any;
  if (w.AMap) return Promise.resolve(w.AMap);

  if (w.__amapLoading) return w.__amapLoading;

  if (securityCode) {
    w._AMapSecurityConfig = { securityJsCode: securityCode };
  }

  w.__amapLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}`;
    script.async = true;
    script.onload = () => resolve(w.AMap);
    script.onerror = () => reject(new Error('AMap load error'));
    document.head.appendChild(script);
  });

  return w.__amapLoading;
};

const parseLocationString = (locStr?: string) => {
  if (!locStr) return null;
  const parts = locStr.split(',');
  if (parts.length !== 2) return null;
  const lng = Number(parts[0]);
  const lat = Number(parts[1]);
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) return null;
  return { lng, lat };
};

const MapScreen = () => {
  const navigation = useNavigation<MapNavigationProp>();
  const route = useRoute<MapRouteProp>();
  const {
    hotelId,
    hotelName,
    address,
    city,
    location,
    nearby,
  } = route.params;

  const [activeTab, setActiveTab] = useState<CategoryKey>('transportation');
  const [mapLocation, setMapLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapStatus, setMapStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [mapError, setMapError] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [selectedPoiIndex, setSelectedPoiIndex] = useState<number | null>(null);
  const [mapAreaHeight, setMapAreaHeight] = useState(0);
  const [headerBlockHeight, setHeaderBlockHeight] = useState(0);
  const insets = useSafeAreaInsets();
  const sheetTranslateY = useSharedValue(FALLBACK_MAX_HEIGHT - FALLBACK_MID_HEIGHT);
  const sheetStartY = useSharedValue(FALLBACK_MAX_HEIGHT - FALLBACK_MID_HEIGHT);
  const [sheetSnapY, setSheetSnapY] = useState<number | null>(null);

  const mapContainerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const hotelMarkerRef = useRef<any>(null);
  const poiMarkersRef = useRef<any[]>([]);
  const listRef = useRef<ScrollView>(null);
  const itemOffsetsRef = useRef<number[]>([]);

  const { effectiveNearby, autoLoading, autoError } = useNearbyPoi({
    initialNearby: nearby,
    location: mapLocation,
    autoFetch: true,
  });

  const currentPois = useMemo(() => {
    if (activeTab === 'attractions') return effectiveNearby.attractions;
    if (activeTab === 'shopping') return effectiveNearby.shopping;
    return effectiveNearby.transportation;
  }, [activeTab, effectiveNearby]);

  useEffect(() => {
    setSelectedPoiIndex(null);
    itemOffsetsRef.current = [];
  }, [activeTab, currentPois]);

  const sheetHeights = useMemo(() => {
    const maxHeight =
      mapAreaHeight > 0
        ? Math.max(headerBlockHeight + 120, mapAreaHeight - 24)
        : FALLBACK_MAX_HEIGHT;
    const minHeight =
      headerBlockHeight > 0
        ? Math.min(headerBlockHeight + 8, maxHeight - 40)
        : FALLBACK_MIN_HEIGHT;
    const midHeight = Math.max(
      minHeight + 40,
      Math.min(FALLBACK_MID_HEIGHT, maxHeight - 40)
    );
    return { maxHeight, midHeight, minHeight };
  }, [mapAreaHeight, headerBlockHeight]);

  const sheetMaxTranslate = sheetHeights.maxHeight - sheetHeights.minHeight;
  const sheetMidTranslate = sheetHeights.maxHeight - sheetHeights.midHeight;
  const focusOffsetY = useMemo(
    () => (showInfo && mapAreaHeight ? Math.round(mapAreaHeight * 0.25) : 0),
    [mapAreaHeight, showInfo]
  );
  const listBottomPadding = useMemo(() => {
    const base = Math.max(insets.bottom, 12) + 16;
    const extra = sheetSnapY ? Math.max(0, sheetSnapY - 4) : 0;
    return base + extra;
  }, [insets.bottom, sheetSnapY]);

  useEffect(() => {
    if (!showInfo) return;
    sheetTranslateY.value = withSpring(sheetMidTranslate, {
      damping: 18,
      stiffness: 180,
    });
    setSheetSnapY(sheetMidTranslate);
  }, [showInfo, sheetTranslateY, sheetMidTranslate]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const scrollToPoi = (index: number) => {
    const y = itemOffsetsRef.current[index];
    if (typeof y === 'number') {
      listRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
    }
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      sheetStartY.value = sheetTranslateY.value;
    })
    .onUpdate((event) => {
      const next = sheetStartY.value + event.translationY;
      const clamped = Math.max(0, Math.min(next, sheetMaxTranslate));
      sheetTranslateY.value = clamped;
    })
    .onEnd(() => {
      const points = [0, sheetMidTranslate, sheetMaxTranslate];
      let closest = points[0];
      let minDistance = Math.abs(sheetTranslateY.value - points[0]);
      for (let i = 1; i < points.length; i += 1) {
        const distance = Math.abs(sheetTranslateY.value - points[i]);
        if (distance < minDistance) {
          minDistance = distance;
          closest = points[i];
        }
      }
      sheetTranslateY.value = withSpring(closest, {
        damping: 18,
        stiffness: 180,
      });
      runOnJS(setSheetSnapY)(closest);
    });

  useEffect(() => {
    const hasLocation =
      location &&
      Number.isFinite(location.lat) &&
      Number.isFinite(location.lng);

    if (hasLocation) {
      setMapLocation({ lat: location.lat, lng: location.lng });
      setMapStatus('ready');
      return;
    }

    if (!address) {
      setMapStatus('error');
      setMapError('酒店地址为空，无法定位');
      return;
    }

    let cancelled = false;
    setMapStatus('loading');
    setMapError('');

    poiService
      .geocode(address, city)
      .then((res) => {
        if (cancelled) return;
        const locStr = res?.data?.location;
        const parsed = parseLocationString(locStr);
        if (!parsed) {
          setMapStatus('error');
          setMapError('定位失败，无法解析坐标');
          return;
        }
        setMapLocation({ lat: parsed.lat, lng: parsed.lng });
        setMapStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setMapStatus('error');
        setMapError('定位失败，请稍后重试');
      });

    return () => {
      cancelled = true;
    };
  }, [address, city, location]);


  useEffect(() => {
    if (!AMAP_JS_KEY || mapReady) return;

    setMapStatus((prev) => (prev === 'ready' ? prev : 'loading'));

    loadAmap(AMAP_JS_KEY, AMAP_JS_SECURITY_CODE)
      .then(() => {
        if (!mapContainerRef.current) return;
        const w = globalThis as any;
        if (!w.AMap) return;

        mapRef.current = new w.AMap.Map(mapContainerRef.current, {
          zoom: DEFAULT_ZOOM,
          center: [116.397428, 39.90923],
        });
        setMapReady(true);
      })
      .catch(() => {
        setMapStatus('error');
        setMapError('地图加载失败');
      });
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !mapLocation) return;
    const w = globalThis as any;
    const map = mapRef.current;
    const center = [mapLocation.lng, mapLocation.lat];
    const hotelIconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png';
    const poiIconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png';
    const poiActiveIconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36"><path d="M13 0C6.4 0 1 5.4 1 12c0 9 12 24 12 24s12-15 12-24C25 5.4 19.6 0 13 0z" fill="#FF8A00"/><circle cx="13" cy="12" r="4.2" fill="#FFFFFF"/></svg>'
    )}`;

    if (!hotelMarkerRef.current) {
      hotelMarkerRef.current = new w.AMap.Marker({
        position: center,
        title: hotelName || '',
        icon: hotelIconUrl,
        offset: new w.AMap.Pixel(0, -18),
      });
      map.add(hotelMarkerRef.current);
    } else {
      hotelMarkerRef.current.setPosition(center);
    }

    map.setZoom(DEFAULT_ZOOM);
    setTimeout(() => {
      if (focusOffsetY) {
        const pixel = map.lngLatToContainer(center);
        pixel.y += focusOffsetY;
        const shifted = map.containerToLngLat(pixel);
        map.setCenter(shifted);
      } else {
        map.setCenter(center);
      }
    }, 60);

    if (poiMarkersRef.current.length) {
      map.remove(poiMarkersRef.current);
      poiMarkersRef.current = [];
    }

    currentPois.forEach((poi, index) => {
      const parsed = parseLocationString(poi.location);
      if (!parsed) return;
      const marker = new w.AMap.Marker({
        position: [parsed.lng, parsed.lat],
        title: poi.name || '',
        icon: poiIconUrl,
        offset: new w.AMap.Pixel(0, -12),
      });
      marker.on('click', () => {
        setSelectedPoiIndex(index);
        scrollToPoi(index);
        const focusZoom = Math.max(map.getZoom(), DEFAULT_ZOOM + 2);
        const pos = marker.getPosition();
        map.setZoom(focusZoom);
        setTimeout(() => {
          if (focusOffsetY) {
            const pixel = map.lngLatToContainer(pos);
            pixel.y += focusOffsetY;
            const shifted = map.containerToLngLat(pixel);
            map.setCenter(shifted);
          } else {
            map.setCenter(pos);
          }
        }, 60);
      });
      poiMarkersRef.current.push(marker);
    });

    if (poiMarkersRef.current.length) {
      map.add(poiMarkersRef.current);
    }
  }, [mapReady, mapLocation, currentPois, hotelName, focusOffsetY]);

  useEffect(() => {
    if (!mapReady) return;
    const w = globalThis as any;
    const poiIconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_bs.png';
    const poiActiveIconUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="26" height="36" viewBox="0 0 26 36"><path d="M13 0C6.4 0 1 5.4 1 12c0 9 12 24 12 24s12-15 12-24C25 5.4 19.6 0 13 0z" fill="#FF8A00"/><circle cx="13" cy="12" r="4.2" fill="#FFFFFF"/></svg>'
    )}`;
    poiMarkersRef.current.forEach((marker, i) => {
      marker.setIcon(i === selectedPoiIndex ? poiActiveIconUrl : poiIconUrl);
      marker.setTop(i === selectedPoiIndex);
      if (marker.setAnimation) {
        marker.setAnimation(i === selectedPoiIndex ? 'AMAP_ANIMATION_BOUNCE' : 'AMAP_ANIMATION_NONE');
      }
    });
  }, [selectedPoiIndex, mapReady, currentPois]);

  const renderMap = () => {
    if (!AMAP_JS_KEY) {
      return (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackText}>缺少高德 JS Key</Text>
        </View>
      );
    }

    if (mapStatus === 'error') {
      return (
        <View style={styles.mapFallback}>
          <Text style={styles.mapFallbackText}>{mapError || '无法定位酒店'}</Text>
        </View>
      );
    }

    return (
      <View style={styles.mapWrapper}>
        <View ref={mapContainerRef} style={styles.webMap} />
        {mapStatus === 'loading' && (
          <View style={styles.mapLoading}>
            <ActivityIndicator size="small" color="#FF385C" />
            <Text style={styles.mapLoadingText}>定位中...</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {hotelName}
          </Text>
        </View>
      </SafeAreaView>

      <View
        style={styles.mapArea}
        onLayout={(e) => setMapAreaHeight(e.nativeEvent.layout.height)}
      >
        {renderMap()}
        {showInfo ? (
          <Animated.View
            style={[
              styles.infoPanel,
              sheetStyle,
              { height: sheetHeights.maxHeight },
            ]}
          >
            <GestureDetector gesture={panGesture}>
              <Animated.View>
                <View
                  onLayout={(e) =>
                    setHeaderBlockHeight(e.nativeEvent.layout.height)
                  }
                >
                  <View style={styles.dragHandle} />
                  <View style={styles.infoHeader}>
                    <TouchableOpacity
                      onPress={() => setShowInfo(false)}
                      style={styles.closeBtn}
                    >
                      <Text style={styles.closeText}>×</Text>
                    </TouchableOpacity>
                    <View style={styles.infoTextBlock}>
                      <Text style={styles.hotelTitle} numberOfLines={1}>
                        {hotelName}
                      </Text>
                      <Text style={styles.hotelAddress} numberOfLines={2}>
                        {address || '暂无地址'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tabRow}>
                    {TAB_OPTIONS.map((tab) => (
                      <TouchableOpacity
                        key={tab.key}
                        style={[
                          styles.tabItem,
                          activeTab === tab.key && styles.tabItemActive,
                        ]}
                        onPress={() => setActiveTab(tab.key)}
                      >
                        <Text
                          style={[
                            styles.tabText,
                            activeTab === tab.key && styles.tabTextActive,
                          ]}
                        >
                          {tab.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            </GestureDetector>

            <ScrollView
              ref={listRef}
              style={styles.list}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: listBottomPadding }}
            >
              {currentPois.length === 0 ? (
                <Text style={styles.emptyText}>
                  {autoLoading
                    ? '正在加载周边信息...'
                    : autoError
                      ? '周边信息获取失败'
                      : '暂无周边信息'}
                </Text>
              ) : (
                <>
                  {currentPois.map((poi, index) => (
                    <TouchableOpacity
                      key={`${poi.name}-${index}`}
                      onLayout={(e) => {
                        itemOffsetsRef.current[index] = e.nativeEvent.layout.y;
                      }}
                      onPress={() => {
                        setSelectedPoiIndex(index);
                        scrollToPoi(index);
                        const marker = poiMarkersRef.current[index];
                        if (marker) {
                          const map = mapRef.current;
                          const focusZoom = map ? Math.max(map.getZoom(), DEFAULT_ZOOM + 2) : DEFAULT_ZOOM + 2;
                          const pos = marker.getPosition();
                          if (map) {
                            map.setZoom(focusZoom);
                            setTimeout(() => {
                              if (focusOffsetY) {
                                const pixel = map.lngLatToContainer(pos);
                                pixel.y += focusOffsetY;
                                const shifted = map.containerToLngLat(pixel);
                                map.setCenter(shifted);
                              } else {
                                map.setCenter(pos);
                              }
                            }, 60);
                          }
                        }
                      }}
                      style={[
                        styles.listItem,
                        selectedPoiIndex === index && styles.listItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.poiName,
                          selectedPoiIndex === index && styles.poiNameActive,
                        ]}
                      >
                        {poi.name}
                      </Text>
                      {poi.distance ? (
                        <Text style={styles.poiDistance}>
                          {formatDistance(poi.distance)}
                        </Text>
                      ) : null}
                    </TouchableOpacity>
                  ))}
                  {!autoLoading && (
                    <View style={styles.listFooter}>
                      <Text style={styles.listFooterText}>已到最底了</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </Animated.View>
        ) : (
          <TouchableOpacity
            style={styles.showInfoBtn}
            onPress={() => setShowInfo(true)}
          >
            <Text style={styles.showInfoText}>显示信息</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  backText: {
    fontSize: 18,
    color: '#333',
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  mapArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  mapWrapper: {
    flex: 1,
  },
  webMap: {
    flex: 1,
  },
  mapLoading: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  mapLoadingText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#333',
  },
  mapFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  mapFallbackText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  infoPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 300,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
    dragHandle: {
    alignSelf: 'center',
    marginTop: 8,
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    marginRight: 8,
  },
  closeText: {
    fontSize: 18,
    color: '#555',
  },
  infoTextBlock: {
    flex: 1,
  },
  hotelTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222',
  },
  hotelAddress: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1',
  },
  tabItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  tabItemActive: {
    backgroundColor: '#FF385C',
  },
  tabText: {
    fontSize: 12,
    color: '#666',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  listItemActive: {
    backgroundColor: 'rgba(255,138,0,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,138,0,0.6)',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  poiName: {
    fontSize: 14,
    color: '#222',
    flex: 1,
    paddingRight: 8,
  },
  poiNameActive: {
    color: '#FF8A00',
    fontWeight: '600',
  },
  poiDistance: {
    fontSize: 12,
    color: '#888',
  },
  listFooter: {
    marginTop: 8,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fafafa',
  },
  listFooterText: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 24,
  },
  showInfoBtn: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  showInfoText: {
    fontSize: 12,
    color: '#333',
  },
});

export default MapScreen;
