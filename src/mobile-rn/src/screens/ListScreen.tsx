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
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { hotelService } from '../services/hotelService';
import { Hotel } from '../types/hotel';

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

  useEffect(() => {
    fetchHotels(1);
  }, []);

  const fetchHotels = async (pageNum: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const params = {
        ...route.params,
        page: pageNum,
        limit: 10,
      };

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

  const renderHotelCard = ({ item }: { item: Hotel }) => {
    const minPrice = item.rooms && item.rooms.length > 0
      ? Math.min(...item.rooms.map(r => r.price))
      : 299;
    const hasMultipleRooms = item.rooms && item.rooms.length > 1;
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
            <Text style={styles.tagDivider}>·</Text>
            <Text style={styles.tag}>{item.type || '精品酒店'}</Text>
          </View>

          {nearbyInfo && (
            <Text style={styles.nearbyInfo} numberOfLines={1}>
              📍 {nearbyInfo}
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

  return (
    <View style={styles.container}>
      {/* 顶部导航栏 - 显示查询信息 */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.navLeft}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {route.params?.city || '酒店列表'}
          </Text>
          {(route.params?.checkIn || route.params?.checkOut) && (
            <Text style={styles.navSubtitle} numberOfLines={1}>
              {route.params.checkIn} - {route.params.checkOut}
            </Text>
          )}
        </View>
        <View style={styles.navRight} />
      </View>

      {/* 顶部筛选栏 - TODO: 实现下拉选择功能 */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterItem}>
          <Text style={styles.filterText}>价格</Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterItem}>
          <Text style={styles.filterText}>评分</Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterItem}>
          <Text style={styles.filterText}>设施</Text>
          <Text style={styles.filterIcon}>▼</Text>
        </TouchableOpacity>
      </View>

      {/* 酒店列表 - 支持上滑自动加载 */}
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  navLeft: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#333',
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  navSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  navRight: {
    width: 40,
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
  tagDivider: {
    marginHorizontal: 6,
    fontSize: 12,
    color: '#ccc',
  },
  nearbyInfo: {
    fontSize: 13,
    color: '#666',
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
});

export default ListScreen;
