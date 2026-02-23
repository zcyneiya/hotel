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
} from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AMAP_JS_KEY, AMAP_JS_SECURITY_CODE } from '../config';
import { poiService } from '../services/poiService';
import { useNearbyPoi } from '../hooks/useNearbyPoi';
import { formatDistance } from '../utils/poi';
import { SafeAreaView } from 'react-native-safe-area-context';

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


const buildMapHtml = (key: string, securityCode?: string) => {
  const securityScript = securityCode
    ? `window._AMapSecurityConfig = { securityJsCode: '${securityCode}' };`
    : '';
  const hotelIconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png';
  const poiIconUrl = 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png';

  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<style>
  html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
</style>
<script>
${securityScript}
</script>
<script src="https://webapi.amap.com/maps?v=2.0&key=${key}"></script>
</head>
<body>
<div id="map"></div>
<script>
  var map = new AMap.Map('map', { zoom: ${DEFAULT_ZOOM}, center: [116.397428, 39.90923] });
  var hotelMarker = null;
  var poiMarkers = [];

  function clearPoiMarkers() {
    if (poiMarkers.length) {
      map.remove(poiMarkers);
      poiMarkers = [];
    }
  }

  function parseLocationString(locStr) {
    if (!locStr) return null;
    var parts = locStr.split(',');
    if (parts.length !== 2) return null;
    var lng = Number(parts[0]);
    var lat = Number(parts[1]);
    if (!isFinite(lng) || !isFinite(lat)) return null;
    return [lng, lat];
  }

  function render(payload) {
    if (!payload || !payload.hotel || !payload.hotel.location) {
      clearPoiMarkers();
      return;
    }
    var lng = payload.hotel.location.lng;
    var lat = payload.hotel.location.lat;
    if (!isFinite(lng) || !isFinite(lat)) return;

    var position = [lng, lat];
    if (!hotelMarker) {
      hotelMarker = new AMap.Marker({
        position: position,
        title: payload.hotel.name || '',
        icon: '${hotelIconUrl}',
        offset: new AMap.Pixel(0, -18)
      });
      map.add(hotelMarker);
    } else {
      hotelMarker.setPosition(position);
    }
    map.setZoomAndCenter(${DEFAULT_ZOOM}, position);

    clearPoiMarkers();
    if (Array.isArray(payload.pois)) {
      payload.pois.forEach(function (poi) {
        var loc = parseLocationString(poi.location);
        if (!loc) return;
        var marker = new AMap.Marker({
          position: loc,
          title: poi.name || '',
          icon: '${poiIconUrl}',
          offset: new AMap.Pixel(0, -12)
        });
        poiMarkers.push(marker);
      });
      if (poiMarkers.length) {
        map.add(poiMarkers);
      }
    }
  }

  function handleMessage(event) {
    var data = event.data;
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
    if (data && data.type === 'render') {
      render(data.payload || {});
    }
  }

  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);

  if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'ready' }));
  }
</script>
</body>
</html>`;
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
  const [webReady, setWebReady] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const webViewRef = useRef<WebView>(null);
  const [mapAreaHeight, setMapAreaHeight] = useState(0);
  const [headerBlockHeight, setHeaderBlockHeight] = useState(0);
  const sheetTranslateY = useSharedValue(FALLBACK_MAX_HEIGHT - FALLBACK_MID_HEIGHT);
  const sheetStartY = useSharedValue(FALLBACK_MAX_HEIGHT - FALLBACK_MID_HEIGHT);

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

  useEffect(() => {
    if (!showInfo) return;
    sheetTranslateY.value = withSpring(sheetMidTranslate, {
      damping: 18,
      stiffness: 180,
    });
  }, [showInfo, sheetTranslateY, sheetMidTranslate]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

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
        if (!locStr) {
          setMapStatus('error');
          setMapError('定位失败，无法解析坐标');
          return;
        }
        const [lngStr, latStr] = locStr.split(',');
        const lng = Number(lngStr);
        const lat = Number(latStr);
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
          setMapStatus('error');
          setMapError('定位失败，坐标格式无效');
          return;
        }
        setMapLocation({ lat, lng });
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


  const mapHtml = useMemo(() => {
    if (!AMAP_JS_KEY) return '';
    return buildMapHtml(AMAP_JS_KEY, AMAP_JS_SECURITY_CODE);
  }, [AMAP_JS_KEY, AMAP_JS_SECURITY_CODE]);

  useEffect(() => {
    if (!webReady || !mapLocation) return;
    const payload = {
      hotel: {
        id: hotelId,
        name: hotelName,
        location: mapLocation,
      },
      pois: currentPois,
    };
    webViewRef.current?.postMessage(
      JSON.stringify({ type: 'render', payload })
    );
  }, [webReady, mapLocation, currentPois, hotelId, hotelName]);

  const handleWebMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'ready') {
        setWebReady(true);
      }
    } catch (e) {
      // ignore
    }
  };

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
        <WebView
          ref={webViewRef}
          source={{ html: mapHtml }}
          originWhitelist={['*']}
          onMessage={handleWebMessage}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          style={styles.webview}
        />
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

            <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
              {currentPois.length === 0 ? (
                <Text style={styles.emptyText}>
                  {autoLoading
                    ? '正在加载周边信息...'
                    : autoError
                      ? '周边信息获取失败'
                      : '暂无周边信息'}
                </Text>
              ) : (
                currentPois.map((poi, index) => (
                  <View key={`${poi.name}-${index}`} style={styles.listItem}>
                    <Text style={styles.poiName}>{poi.name}</Text>
                    {poi.distance ? (
                      <Text style={styles.poiDistance}>
                        {formatDistance(poi.distance)}
                      </Text>
                    ) : null}
                  </View>
                ))
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
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
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
  poiName: {
    fontSize: 14,
    color: '#222',
    flex: 1,
    paddingRight: 8,
  },
  poiDistance: {
    fontSize: 12,
    color: '#888',
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
