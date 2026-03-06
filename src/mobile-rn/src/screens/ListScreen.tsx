import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
import { Skeleton, SkeletonBlock } from '../components/common/Skeleton';

type ListScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'List'
>;
type ListScreenRouteProp = RouteProp<RootStackParamList, 'List'>;

const ListScreen = () => {
  const navigation = useNavigation<ListScreenNavigationProp>();
  const route = useRoute<ListScreenRouteProp>();
  const listRef = useRef<FlatList<Hotel>>(null);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showBackTop, setShowBackTop] = useState(false);

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

  useEffect(() => {
    if (activeFilterTab) {
      setShowBackTop(false);
    }
  }, [activeFilterTab]);

  const fetchHotels = useCallback(async (pageNum: number) => {
    if (loading && pageNum > 1) return; //加载更多且有请求正在执行，就跳过，防止重复翻页

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
      
      //console.log('Fetching hotels params:', params); 

      const response = await hotelService.getHotels(params);

      if (pageNum === 1) {
        setHotels(response.data.hotels);
      } else {
        setHotels(prev => [...prev, ...response.data.hotels]);
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
  }, [city, keyword, checkInDate, checkOutDate, priceRange, ratingFilter, facilitiesFilter, loading]);

  const handleLoadMore = useCallback(() => {
    // 只有当有更多数据，且不在加载中，且确实有数据时才加载下一页
    if (hasMore && !loading && hotels.length > 0) {
      fetchHotels(page + 1);
    }
  }, [hasMore, loading, hotels.length, fetchHotels, page]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHotels(1);
  }, [fetchHotels]);

  const goToDetail = useCallback((id: string) => {
    navigation.navigate('Detail', { id });
  }, [navigation]);

  const handleFavorite = useCallback((hotelId: string) => {
    Alert.alert('提示', '已收藏');
  }, []);

  // 处理日期选择
  const handleDateConfirm = useCallback((checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
    fetchHotels(1);
  }, [fetchHotels]);
  
  const renderItem = useCallback(({ item }: { item: Hotel }) => (
    <HotelCard
      item={item}
      onPress={goToDetail}
      onFavorite={handleFavorite}
    />
  ), [goToDetail, handleFavorite]);

  const keyExtractor = useCallback((item: Hotel) => item._id, []);

  const renderFooter = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#FF385C" />
        <Text style={styles.footerText}>加载中...</Text>
      </View>
    );
  }, [loading]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🏨</Text>
        <Text style={styles.emptyText}>暂无酒店数据</Text>
      </View>
    );
  }, [loading]);

  const showSkeleton = loading && hotels.length === 0;

  const renderListSkeleton = () => {
    return (
      <View style={styles.listContent}>
        <Skeleton>
          {[0, 1, 2].map((idx) => (
            <SkeletonBlock key={`list-skeleton-${idx}`} style={styles.skeletonCard}>
              <SkeletonBlock width="100%" height={180} borderRadius={16} />
              <SkeletonBlock width="70%" height={18} style={styles.skeletonLineLg} />
              <SkeletonBlock width="45%" height={14} style={styles.skeletonLineSm} />
              <SkeletonBlock width="35%" height={18} style={styles.skeletonLinePrice} />
            </SkeletonBlock>
          ))}
        </Skeleton>
      </View>
    );
  };

  //控制回顶按钮的显示和隐藏
  const handleScroll = useCallback((event: any) => {
    const offsetY = event?.nativeEvent?.contentOffset?.y || 0;
    if (activeFilterTab) { //筛选框打开
      if (showBackTop) setShowBackTop(false);
      return;
    }
    if (offsetY > 400 && !showBackTop) setShowBackTop(true);
    if (offsetY <= 400 && showBackTop) setShowBackTop(false);
  }, [activeFilterTab, showBackTop]);

  const handleBackTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

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
        {showSkeleton ? (
          renderListSkeleton()
        ) : (
          <FlatList
            ref={listRef}
            //数据与渲染
            data={hotels}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.listContent}
            //性能优化
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={7}
            updateCellsBatchingPeriod={50}// 每 50ms 批量更新一次，减少渲染频率
            removeClippedSubviews={true}// 移出屏幕的 item 从渲染树中卸载，节省内存
            //分页加载
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5} // 距底部 50% 时触发，防止空列表误触发
            //滚动事件
            onScroll={handleScroll}
            scrollEventThrottle={16}
            scrollEnabled={!activeFilterTab} // 当有筛选框打开时，禁止滚动
            //下拉刷新
            onRefresh={handleRefresh}
            refreshing={refreshing}
            //插槽组件
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            
          />
        )}
      </View>

      {showBackTop && !activeFilterTab && (
        <TouchableOpacity style={styles.backTopBtn} onPress={handleBackTop}>
          <View style={styles.backTopIcon}>
            <View style={styles.backTopLine} />
            <Text style={styles.backTopArrow}>↑</Text>
          </View>
        </TouchableOpacity>
      )}

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
  skeletonCard: {
    marginBottom: 16,
  },
  skeletonLineLg: {
    marginTop: 12,
  },
  skeletonLineSm: {
    marginTop: 8,
  },
  skeletonLinePrice: {
    marginTop: 12,
  },
  backTopBtn: {
    position: 'absolute',
    right: 16,
    bottom: 80,
    backgroundColor: 'rgba(255,255,255,0.8)',
    width: 35,
    height: 35,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    zIndex: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  backTopIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backTopLine: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#22222275',
    marginBottom: 1,
  },
  backTopArrow: {
    color: '#22222275',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: -2,
  },
});

export default ListScreen;
