import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';
import {hotelService} from '../services/hotelService';
import {Hotel} from '../types/hotel';

const {width} = Dimensions.get('window');

type DetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Detail'
>;
type DetailScreenRouteProp = RouteProp<RootStackParamList, 'Detail'>;

const DetailScreen = () => {
  const navigation = useNavigation<DetailScreenNavigationProp>();
  const route = useRoute<DetailScreenRouteProp>();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchHotel();
  }, []);

  const fetchHotel = async () => {
    try {
      const response = await hotelService.getHotelById(route.params.id);
      setHotel(response.data);
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Alert.alert('提示', isFavorite ? '已取消收藏' : '已收藏');
  };

  const handleBook = (roomType: string) => {
    Alert.alert('提示', '预订功能开发中');
  };

  const getHotelName = (name: Hotel['name']): string => {
    if (typeof name === 'string') {
      return name;
    }
    return name.cn || name.en || '未知酒店';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF385C" />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🏨</Text>
        <Text style={styles.errorText}>酒店不存在</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = hotel.images?.length > 0 
    ? hotel.images 
    : ['https://via.placeholder.com/750x500/667eea/ffffff?text=Hotel'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 图片轮播 */}
        <View style={styles.imageSection}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentImageIndex(index);
            }}
            scrollEventThrottle={16}>
            {images.map((img, index) => (
              <Image
                key={index}
                source={{uri: img}}
                style={styles.hotelImage}
              />
            ))}
          </ScrollView>

          {/* 图片指示器 */}
          <View style={styles.imageIndicator}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorDot,
                  index === currentImageIndex && styles.indicatorDotActive,
                ]}
              />
            ))}
          </View>

          {/* 返回和收藏按钮 */}
          <View style={styles.topActions}>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => navigation.goBack()}>
              <Text style={styles.actionIcon}>←</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleFavorite}>
              <Text style={styles.actionIcon}>{isFavorite ? '♥' : '♡'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 酒店基本信息 */}
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.hotelName}>{getHotelName(hotel.name)}</Text>
            <View style={styles.ratingBadge}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{hotel.rating || '4.8'}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.starLevel}>
              {'⭐'.repeat(hotel.starLevel || 4)}
            </Text>
            <Text style={styles.divider}>·</Text>
            <Text style={styles.hotelType}>{hotel.type || '精品酒店'}</Text>
          </View>

          <View style={styles.addressRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.address}>{hotel.address || '市中心'}</Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View style={styles.dividerLine} />

        {/* 设施服务 */}
        {hotel.facilities && hotel.facilities.length > 0 && (
          <>
            <View style={styles.facilitiesSection}>
              <Text style={styles.sectionTitle}>设施与服务</Text>
              <View style={styles.facilitiesGrid}>
                {hotel.facilities.map((facility, index) => (
                  <View key={index} style={styles.facilityItem}>
                    <Text style={styles.facilityIcon}>✓</Text>
                    <Text style={styles.facilityName}>{facility}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.dividerLine} />
          </>
        )}

        {/* 房型列表 */}
        <View style={styles.roomsSection}>
          <Text style={styles.sectionTitle}>选择房型</Text>
          {hotel.rooms
            ?.sort((a, b) => a.price - b.price)
            .map((room, index) => (
              <View key={index} style={styles.roomCard}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomType}>{room.type}</Text>
                  {room.area && (
                    <Text style={styles.roomArea}>{room.area}㎡</Text>
                  )}
                </View>

                {room.facilities && room.facilities.length > 0 && (
                  <View style={styles.roomFacilities}>
                    {room.facilities.slice(0, 3).map((f, i) => (
                      <Text key={i} style={styles.roomFacility}>
                        • {f}
                      </Text>
                    ))}
                  </View>
                )}

                <View style={styles.roomFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={styles.priceLabel}>¥</Text>
                    <Text style={styles.roomPrice}>{room.price}</Text>
                    <Text style={styles.priceUnit}>/晚</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => handleBook(room.type)}>
                    <Text style={styles.bookText}>预订</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>

        {/* 底部占位 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imageSection: {
    position: 'relative',
    height: 300,
  },
  hotelImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topActions: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
    color: '#333',
  },
  infoSection: {
    padding: 20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  hotelName: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  starIcon: {
    fontSize: 16,
    color: '#FFB400',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  starLevel: {
    fontSize: 14,
  },
  divider: {
    marginHorizontal: 8,
    fontSize: 14,
    color: '#ccc',
  },
  hotelType: {
    fontSize: 14,
    color: '#666',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  address: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  dividerLine: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  facilitiesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  facilityItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  facilityIcon: {
    fontSize: 16,
    color: '#4CAF50',
    marginRight: 8,
  },
  facilityName: {
    fontSize: 14,
    color: '#666',
  },
  roomsSection: {
    padding: 20,
  },
  roomCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  roomType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  roomArea: {
    fontSize: 14,
    color: '#666',
  },
  roomFacilities: {
    marginBottom: 12,
  },
  roomFacility: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 14,
    color: '#FF385C',
    fontWeight: 'bold',
  },
  roomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF385C',
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bookBtn: {
    backgroundColor: '#FF385C',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  bookText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 20,
  },
});

export default DetailScreen;
