import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';
import { getImageUrl } from '../utils/imageUrl';
import DateRangePicker from '../components/DateRangePicker';

const { width } = Dimensions.get('window');

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);

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

  const handleBook = (roomType: string, availableRooms: number) => {
    if (availableRooms < 3) {
      Alert.alert('提示', `仅剩${availableRooms}间，请尽快预订！`, [
        { text: '取消', style: 'cancel' },
        { text: '立即预订', onPress: () => Alert.alert('提示', '预订功能开发中') }
      ]);
    } else {
      Alert.alert('提示', '预订功能开发中');
    }
  };

  const getHotelName = (name: Hotel['name']): string => {
    if (typeof name === 'string') {
      return name;
    }
    return name.cn || name.en || '未知酒店';
  };

  // 处理日期选择
  const handleDateConfirm = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}月${parts[2]}日`;
  };

  const formatOpenDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`;
    } catch (e) {
      return dateStr;
    }
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
    : [];

  // Mock 评价数据
  const mockReviews = hotel.reviews || [
    {
      id: '1',
      userName: '张三',
      rating: 5,
      content: '酒店环境很好，服务态度也很棒，下次还会再来！',
      date: '2026-01-15',
    },
    {
      id: '2',
      userName: '李四',
      rating: 4.5,
      content: '位置不错，交通便利，房间干净整洁。',
      date: '2026-01-10',
    },
    {
      id: '3',
      userName: '王五',
      rating: 5,
      content: '性价比很高，早餐丰富，推荐！',
      date: '2026-01-05',
    },
  ];

  const avgRating = hotel.rating || 4.8;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 图片轮播 - 滚动展示 */}
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
            {images.length > 0 ? images.map((img, index) => (
              <Image
                key={index}
                source={{ uri: getImageUrl(img) }}
                style={styles.hotelImage}
              />
            )) : (
              <Image
                source={{ uri: getImageUrl(null) }}
                style={styles.hotelImage}
              />
            )}
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
              <Text style={styles.ratingText}>{avgRating}</Text>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.metaLeft}>
              <Text style={styles.starLevel}>
                {'⭐'.repeat(hotel.starLevel || 4)}
              </Text>
              <Text style={styles.divider}>{hotel.type ? '·' : ''}</Text>
              <Text style={styles.hotelType}>{hotel.type || ''}</Text>
            </View>
            {hotel.openDate && (
              <Text style={styles.openingDate}>
                开业时间: {formatOpenDate(hotel.openDate)}
              </Text>
            )}
          </View>

          <View style={styles.addressRow}>
            <Text style={styles.address}>{hotel.address || '市中心'}</Text>
          </View>

          {/* 附近景点、交通、商场 */}
          {(hotel.nearbyAttractions || hotel.nearbyTransport || hotel.nearbyMalls) && (
            <View style={styles.nearbySection}>
              {hotel.nearbyAttractions && hotel.nearbyAttractions.length > 0 && (
                <View style={styles.nearbyItem}>
                  <Text style={styles.nearbyLabel}>🎯 附近景点:</Text>
                  <Text style={styles.nearbyText}>{hotel.nearbyAttractions.join(', ')}</Text>
                </View>
              )}
              {hotel.nearbyTransport && hotel.nearbyTransport.length > 0 && (
                <View style={styles.nearbyItem}>
                  <Text style={styles.nearbyLabel}>🚇 交通:</Text>
                  <Text style={styles.nearbyText}>{hotel.nearbyTransport.join(', ')}</Text>
                </View>
              )}
              {hotel.nearbyMalls && hotel.nearbyMalls.length > 0 && (
                <View style={styles.nearbyItem}>
                  <Text style={styles.nearbyLabel}>🛍️ 商场:</Text>
                  <Text style={styles.nearbyText}>{hotel.nearbyMalls.join(', ')}</Text>
                </View>
              )}
            </View>
          )}
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

        {/* 选择日历、人数、间数 Banner */}
        <View style={styles.bookingBanner}>
          <Text style={styles.bannerTitle}>选择入住信息</Text>
          <View style={styles.bannerRow}>
            <TouchableOpacity 
              style={styles.bannerItem}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.bannerLabel}>日期</Text>
              <Text style={[styles.bannerValue, (checkInDate && checkOutDate) && styles.bannerValueSelected]}>
                {checkInDate && checkOutDate 
                  ? `${formatDateDisplay(checkInDate)} - ${formatDateDisplay(checkOutDate)}`
                  : '选择日期'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bannerItem}
              onPress={() => {
                Alert.prompt(
                  '选择人数',
                  '请输入入住人数',
                  [
                    { text: '取消', style: 'cancel' },
                    { 
                      text: '确定', 
                      onPress: (text: string | undefined) => {
                        const count = parseInt(text || '2');
                        if (count > 0 && count <= 10) {
                          setGuestCount(count);
                        }
                      }
                    }
                  ],
                  'plain-text',
                  String(guestCount)
                );
              }}>
              <Text style={styles.bannerLabel}>人数</Text>
              <Text style={styles.bannerValue}>{guestCount}人</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bannerItem}
              onPress={() => {
                Alert.prompt(
                  '选择间数',
                  '请输入房间数量',
                  [
                    { text: '取消', style: 'cancel' },
                    { 
                      text: '确定', 
                      onPress: (text: string | undefined) => {
                        const count = parseInt(text || '1');
                        if (count > 0 && count <= 5) {
                          setRoomCount(count);
                        }
                      }
                    }
                  ],
                  'plain-text',
                  String(roomCount)
                );
              }}>
              <Text style={styles.bannerLabel}>间数</Text>
              <Text style={styles.bannerValue}>{roomCount}间</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dividerLine} />

        {/* 房型列表 - 从低到高排序 */}
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

                <View style={styles.roomMeta}>
                  <Text style={styles.roomCapacity}>可住{room.capacity}人</Text>
                  <Text style={styles.roomDivider}>·</Text>
                  <Text style={styles.roomCount}>剩余{room.availableRooms}间</Text>
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
                    onPress={() => handleBook(room.type, room.availableRooms || room.totalRooms)}>
                    <Text style={styles.bookText}>预订</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
        </View>

        {/* 优惠活动 */}
        {hotel.promotions && hotel.promotions.length > 0 && (
          <>
            <View style={styles.dividerLine} />
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>优惠活动</Text>
              {hotel.promotions.map((promo, index) => (
                <View key={index} style={styles.promotionCard}>
                  <View style={styles.promotionHeader}>
                     <Text style={styles.promotionTag}>优惠</Text>
                     <Text style={styles.promotionTitle}>{promo.title}</Text>
                  </View>
                  <Text style={styles.promotionDesc}>{promo.description}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.dividerLine} />

        {/* 住客评价区 */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewHeader}>
            <Text style={styles.sectionTitle}>住客评价</Text>
            <View style={styles.avgRatingBox}>
              <Text style={styles.avgRatingScore}>{avgRating}</Text>
              <Text style={styles.avgRatingLabel}>综合评分</Text>
            </View>
          </View>

          {mockReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <View style={styles.reviewUser}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{review.userName[0]}</Text>
                  </View>
                  <View>
                    <Text style={styles.userName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  <Text style={styles.reviewStarIcon}>★</Text>
                  <Text style={styles.reviewScore}>{review.rating}</Text>
                </View>
              </View>
              <Text style={styles.reviewContent}>{review.content}</Text>
            </View>
          ))}
        </View>

        {/* 底部占位 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* 日期选择器 */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />
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
    shadowOffset: { width: 0, height: 2 },
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
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
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
  openingDate: {
    fontSize: 13,
    color: '#666',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  nearbySection: {
    marginTop: 8,
  },
  nearbyItem: {
    marginBottom: 8,
  },
  nearbyLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  nearbyText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  sectionContainer: {
    padding: 20,
  },
  promotionCard: {
    backgroundColor: '#FFF0F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFE4E1',
  },
  promotionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  promotionTag: {
    fontSize: 10,
    color: '#fff',
    backgroundColor: '#FF385C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  promotionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  promotionDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  dividerLine: {
    height: 8,
    backgroundColor: '#f5f5f5',
  },
  bookingBanner: {
    padding: 20,
    backgroundColor: '#fff',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bannerItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  bannerLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bannerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#999',
  },
  bannerValueSelected: {
    color: '#333',
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
    marginBottom: 8,
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
  roomMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomCapacity: {
    fontSize: 13,
    color: '#666',
  },
  roomDivider: {
    marginHorizontal: 8,
    fontSize: 13,
    color: '#ccc',
  },
  roomCount: {
    fontSize: 13,
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
    color: '#FF385C',
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
  reviewsSection: {
    padding: 20,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avgRatingBox: {
    alignItems: 'center',
    backgroundColor: '#FF385C',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  avgRatingScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  avgRatingLabel: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
  reviewCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  reviewStarIcon: {
    fontSize: 14,
    color: '#FFB400',
    marginRight: 4,
  },
  reviewScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reviewContent: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default DetailScreen;
