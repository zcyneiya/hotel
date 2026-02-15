import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';
import DateRangePicker from '../components/DateRangePicker';

const { width } = Dimensions.get('window');

type ListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'List'
>;
type ListScreenRouteProp = RouteProp<RootStackParamList, 'List'>;

const ListScreen = () => {
  const navigation = useNavigation<ListScreenNavigationProp>();
  const route = useRoute<ListScreenRouteProp>();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 搜索条件
  const [city, setCity] = useState(route.params?.city || '');
  const [checkInDate, setCheckInDate] = useState(route.params?.checkIn || '');
  const [checkOutDate, setCheckOutDate] = useState(route.params?.checkOut || '');
  const [keyword, setKeyword] = useState(route.params?.keyword || '');
  const [tags, setTags] = useState(route.params?.tags || '');

  // 筛选条件
  const [priceRange, setPriceRange] = useState<string>('');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [facilitiesFilter, setFacilitiesFilter] = useState<string[]>([]);

  // UI 状态
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [showRatingFilter, setShowRatingFilter] = useState(false);
  const [showFacilitiesFilter, setShowFacilitiesFilter] = useState(false);

  useEffect(() => {
    fetchHotels(1);
  }, [priceRange, ratingFilter, facilitiesFilter]);

  const fetchHotels = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const params: any = {
        city,
        keyword,
        tags,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        page: pageNum,
        limit: 10,
      };

      // 添加筛选条件
      if (priceRange) params.priceRange = priceRange;
      if (ratingFilter) params.rating = ratingFilter;
      if (facilitiesFilter.length > 0) params.facilities = facilitiesFilter.join(',');

      const response = await hotelService.getHotels(params);

      if (pageNum === 1) {
        setHotels(response.data.hotels);
      } else {
        setHotels([...hotels, ...response.data.hotels]);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setPage(pageNum);
    } catch (error: any) {
      Alert.alert('错误', error.message || '加载失败');
      if (pageNum === 1) {
        setHotels([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchHotels(page + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHotels(1);
  };

  const goToDetail = (id: string) => {
    navigation.navigate('Detail', { id });
  };

  const handleFavorite = (hotelId: string) => {
    Alert.alert('提示', '已收藏');
  };

  const getHotelName = (name: Hotel['name']): string => {
    if (typeof name === 'string') {
      return name;
    }
    return name.cn || name.en || '未知酒店';
  };

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}/${parts[2]}`;
  };

  // 计算入住天数
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return 0;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diff = checkOut.getTime() - checkIn.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // 处理日期选择
  const handleDateConfirm = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    fetchHotels(1);
  };

  // 价格筛选选项
  const priceOptions = [
    { label: '不限', value: '' },
    { label: '0-200元', value: '0-200' },
    { label: '200-500元', value: '200-500' },
    { label: '500-1000元', value: '500-1000' },
    { label: '1000元以上', value: '1000-' },
  ];

  // 评分筛选选项
  const ratingOptions = [
    { label: '不限', value: '' },
    { label: '4.5分以上', value: '4.5' },
    { label: '4.0分以上', value: '4.0' },
    { label: '3.5分以上', value: '3.5' },
  ];

  // 设施筛选选项
  const facilitiesOptions = [
    '免费WiFi', '免费停车', '游泳池', '健身房', 
    '餐厅', '会议室', '温泉', '儿童乐园'
  ];

  const toggleFacility = (facility: string) => {
    if (facilitiesFilter.includes(facility)) {
      setFacilitiesFilter(facilitiesFilter.filter(f => f !== facility));
    } else {
      setFacilitiesFilter([...facilitiesFilter, facility]);
    }
  };

  const renderHotelCard = ({ item }: { item: Hotel }) => {
    const minPrice = item.rooms && item.rooms.length > 0
      ? Math.min(...item.rooms.map(r => r.price))
      : 299;
    const hasMultipleRooms = item.rooms && item.rooms.length > 1;
    
    // 附近信息：景点、交通、商场
    const nearbyInfo = [
      ...(item.nearbyAttractions || []),
      ...(item.nearbyTransport || []),
      ...(item.nearbyMalls || [])
    ].slice(0, 2).join(' · ');

    return (
      <TouchableOpacity
        style={styles.hotelCard}
        onPress={() => goToDetail(item._id)}
        activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.images?.[0] || 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel',
            }}
            style={styles.hotelImage}
          />
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={() => handleFavorite(item._id)}>
            <Text style={styles.heartIcon}>♡</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.hotelInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.hotelName} numberOfLines={1}>
              {getHotelName(item.name)}
            </Text>
            <View style={styles.rating}>
              <Text style={styles.starIcon}>★</Text>
              <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
            </View>
          </View>

          <View style={styles.hotelTags}>
            <Text style={styles.tag}>{'⭐'.repeat(item.starLevel || 4)}</Text>
          </View>

          {/* 附近景点、交通、商场 */}
          {nearbyInfo && (
            <Text style={styles.nearbyInfo} numberOfLines={1}>
              📍 {nearbyInfo}
            </Text>
          )}

          {/* 酒店地址 */}
          {item.address && (
            <Text style={styles.addressText} numberOfLines={1}>
              🏠 {item.address}
            </Text>
          )}

          <View style={styles.priceRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>¥</Text>
              <Text style={styles.price}>{minPrice}</Text>
              {hasMultipleRooms && <Text style={styles.priceUnit}>起</Text>}
              <Text style={styles.priceUnit}>/晚</Text>
            </View>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>¥{item.originalPrice}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FF385C" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🏨</Text>
        <Text style={styles.emptyText}>暂无酒店数据</Text>
      </View>
    );
  };

  // 价格筛选弹窗
  const renderPriceFilter = () => (
    <Modal
      visible={showPriceFilter}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPriceFilter(false)}>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPriceFilter(false)}>
        <View style={styles.filterModal}>
          <Text style={styles.filterTitle}>价格范围</Text>
          {priceOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                priceRange === option.value && styles.filterOptionActive,
              ]}
              onPress={() => {
                setPriceRange(option.value);
                setShowPriceFilter(false);
              }}>
              <Text
                style={[
                  styles.filterOptionText,
                  priceRange === option.value && styles.filterOptionTextActive,
                ]}>
                {option.label}
              </Text>
              {priceRange === option.value && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // 评分筛选弹窗
  const renderRatingFilter = () => (
    <Modal
      visible={showRatingFilter}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowRatingFilter(false)}>
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowRatingFilter(false)}>
        <View style={styles.filterModal}>
          <Text style={styles.filterTitle}>评分筛选</Text>
          {ratingOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.filterOption,
                ratingFilter === option.value && styles.filterOptionActive,
              ]}
              onPress={() => {
                setRatingFilter(option.value);
                setShowRatingFilter(false);
              }}>
              <Text
                style={[
                  styles.filterOptionText,
                  ratingFilter === option.value && styles.filterOptionTextActive,
                ]}>
                {option.label}
              </Text>
              {ratingFilter === option.value && (
                <Text style={styles.checkIcon}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // 设施筛选弹窗
  const renderFacilitiesFilter = () => (
    <Modal
      visible={showFacilitiesFilter}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFacilitiesFilter(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.facilitiesModal}>
          <View style={styles.facilitiesHeader}>
            <TouchableOpacity onPress={() => setShowFacilitiesFilter(false)}>
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.facilitiesTitle}>设施筛选</Text>
            <TouchableOpacity onPress={() => setFacilitiesFilter([])}>
              <Text style={styles.resetBtn}>重置</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.facilitiesScroll}>
            <View style={styles.facilitiesGrid}>
              {facilitiesOptions.map((facility) => (
                <TouchableOpacity
                  key={facility}
                  style={[
                    styles.facilityTag,
                    facilitiesFilter.includes(facility) && styles.facilityTagActive,
                  ]}
                  onPress={() => toggleFacility(facility)}>
                  <Text
                    style={[
                      styles.facilityTagText,
                      facilitiesFilter.includes(facility) && styles.facilityTagTextActive,
                    ]}>
                    {facility}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.facilitiesFooter}>
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setShowFacilitiesFilter(false)}>
              <Text style={styles.confirmBtnText}>
                确定 {facilitiesFilter.length > 0 && `(${facilitiesFilter.length})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* 顶部搜索信息栏 */}
      <View style={styles.searchBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.searchInfoScroll}>
          <View style={styles.searchInfo}>
            {/* 城市 */}
            <View style={styles.searchTag}>
              <Text style={styles.searchTagText}>{city || '全部'}</Text>
            </View>
            
            {/* 日期 */}
            {checkInDate && checkOutDate ? (
              <TouchableOpacity 
                style={styles.searchTag}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.searchTagText}>
                  {formatDateDisplay(checkInDate)} - {formatDateDisplay(checkOutDate)}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.searchTag}
                onPress={() => setShowDatePicker(true)}>
                <Text style={styles.searchTagText}>选择日期</Text>
              </TouchableOpacity>
            )}
            
            {/* 入住天数 */}
            {calculateNights() > 0 && (
              <View style={styles.searchTag}>
                <Text style={styles.searchTagText}>{calculateNights()}晚</Text>
              </View>
            )}
            
            {/* 关键词 */}
            {keyword && (
              <View style={styles.searchTag}>
                <Text style={styles.searchTagText}>{keyword}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 筛选栏 */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => setShowPriceFilter(true)}>
          <Text style={[styles.filterText, priceRange && styles.filterTextActive]}>
            价格
          </Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => setShowRatingFilter(true)}>
          <Text style={[styles.filterText, ratingFilter && styles.filterTextActive]}>
            评分
          </Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => setShowFacilitiesFilter(true)}>
          <Text style={[styles.filterText, facilitiesFilter.length > 0 && styles.filterTextActive]}>
            设施
            {facilitiesFilter.length > 0 && ` (${facilitiesFilter.length})`}
          </Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* 酒店列表 */}
      <FlatList
        data={hotels}
        renderItem={renderHotelCard}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      {/* 筛选弹窗 */}
      {renderPriceFilter()}
      {renderRatingFilter()}
      {renderFacilitiesFilter()}

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
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  searchInfoScroll: {
    flex: 1,
  },
  searchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchTag: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  searchTagText: {
    fontSize: 13,
    color: '#333',
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  filterTextActive: {
    color: '#FF385C',
    fontWeight: '600',
  },
  filterIcon: {
    fontSize: 10,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF385C',
  },
  hotelInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  starIcon: {
    fontSize: 14,
    color: '#FFB400',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  hotelTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    fontSize: 12,
    color: '#666',
  },
  nearbyInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF385C',
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 14,
    color: '#FF385C',
    marginLeft: 2,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: width * 0.75,
    maxHeight: 400,
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  filterOptionActive: {
    backgroundColor: '#FFE5E5',
  },
  filterOptionText: {
    fontSize: 15,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#FF385C',
    fontWeight: '600',
  },
  checkIcon: {
    fontSize: 18,
    color: '#FF385C',
    fontWeight: 'bold',
  },
  facilitiesModal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    marginTop: 'auto',
  },
  facilitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeBtn: {
    fontSize: 24,
    color: '#666',
    width: 40,
  },
  facilitiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  resetBtn: {
    fontSize: 14,
    color: '#FF385C',
    width: 40,
    textAlign: 'right',
  },
  facilitiesScroll: {
    maxHeight: 300,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  facilityTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 6,
  },
  facilityTagActive: {
    backgroundColor: '#FF385C',
  },
  facilityTagText: {
    fontSize: 14,
    color: '#666',
  },
  facilityTagTextActive: {
    color: '#fff',
  },
  facilitiesFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListScreen;
