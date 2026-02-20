import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput, // Add TextInput import
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';
import DateRangePicker from '../components/DateRangePicker';
import HotelCard from '../components/list/HotelCard';
import { FilterBar } from '../components/list/FilterBar';
import { SearchBar } from '../components/list/SearchBar';

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

  // 筛选条件
  const [priceRange, setPriceRange] = useState<string>(route.params?.priceRange || '');
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [facilitiesFilter, setFacilitiesFilter] = useState<string[]>(() => {
    // initialize from navigation params
    if (route.params?.tags) {
        return route.params.tags.split(',').filter(t => t.trim() !== '');
    }
    return [];
  });

  const [activeFilterTab, setActiveFilterTab] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    fetchHotels(1);
    // 关闭所有筛选下拉
    setActiveFilterTab(null);
  }, [priceRange, ratingFilter, facilitiesFilter]);

  const fetchHotels = async (pageNum: number) => {
    if (loading && pageNum > 1) return; // Prevent multiple load more requests, but allow refresh/filter

    setLoading(true);
    try {
      const params: any = {
        city,
        keyword,
        // tags, // remove tags
        checkIn: checkInDate,
        checkOut: checkOutDate,
        page: pageNum,
        limit: 10,
      };

      // 添加筛选条件
      if (priceRange) params.priceRange = priceRange;
      if (ratingFilter) params.rating = ratingFilter;
      if (facilitiesFilter.length > 0) params.facilities = facilitiesFilter.join(',');
      
      console.log('Fetching hotels params:', params); 

      const response = await hotelService.getHotels(params);

      if (pageNum === 1) {
        setHotels(response.data.hotels);
      } else {
        setHotels([...hotels, ...response.data.hotels]);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Fetch hotels error:', error);
      if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
          console.error('Error request:', error.request);
      } else {
          console.error('Error message:', error.message);
      }
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
    // 只有当有更多数据，且不在加载中，且确实有数据时才加载下一页
    if (hasMore && !loading && hotels.length > 0) {
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
    
  const getDayMonth = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return '';
    return `${parts[1]}-${parts[2]}`;
  };

  return (
    <View style={styles.container}>
      {/* 顶部搜索信息栏 */}
      <SearchBar
        city={city}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        keyword={keyword}
        onBack={() => navigation.goBack()}
        onDatePress={() => setShowDatePicker(true)}
        onKeywordChange={setKeyword}
        onSearch={() => fetchHotels(1)}
      />

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
          onEndReachedThreshold={0.5} // 调整阈值，防止在空列表时过早触发
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
    backgroundColor: '#fff',
    position: 'relative', 
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
