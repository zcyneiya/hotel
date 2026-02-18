import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';
import DateRangePicker from '../components/DateRangePicker';
import HotelCard from '../components/list/HotelCard';
import { FilterBar } from '../components/list/FilterBar';

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

  const [activeFilterTab, setActiveFilterTab] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    fetchHotels(1);
    // 关闭所有筛选下拉
    setActiveFilterTab(null);
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
  
  const renderItem = ({ item }: { item: Hotel }) => (
    <HotelCard
      item={item}
      onPress={goToDetail}
      onFavorite={handleFavorite}
    />
  );

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

      <FilterBar
        activeTab={activeFilterTab}
        onTabChange={setActiveFilterTab}
        priceRange={priceRange}
        onPriceChange={setPriceRange}
        ratingFilter={ratingFilter}
        onRatingChange={setRatingFilter}
        facilitiesFilter={facilitiesFilter}
        onFacilitiesChange={setFacilitiesFilter}
      />

      <View style={{ flex: 1, zIndex: 1 }}>
        {/* 酒店列表 */}
        <FlatList
          data={hotels}
          renderItem={renderItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!activeFilterTab} // 当有筛选框打开时，禁止滚动
        />
      </View>

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
    position: 'relative', // 确保筛选下拉可以在顶层显示
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 60,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 11, // 确保它在最上面
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
  listContent: {
    padding: 16,
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
});

export default ListScreen;
