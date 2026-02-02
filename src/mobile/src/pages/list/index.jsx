import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, ScrollView, Image, Text } from '@tarojs/components';
import { hotelService } from '../../services/api';
import './index.scss';

export default function List() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [params, setParams] = useState({});

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const { city, keyword, checkIn, checkOut } = instance.router.params;
    setParams({ city, keyword, checkIn, checkOut });
    fetchHotels({ city, keyword, page: 1 });
  }, []);

  const fetchHotels = async (searchParams) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await hotelService.getHotels({
        ...searchParams,
        page: searchParams.page || page,
        limit: 10
      });
      
      if (searchParams.page === 1) {
        setHotels(res.data.hotels);
      } else {
        setHotels([...hotels, ...res.data.hotels]);
      }
      
      setHasMore(res.data.pagination.page < res.data.pagination.pages);
    } catch (error) {
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchHotels({ ...params, page: nextPage });
    }
  };

  const goToDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${id}`
    });
  };

  // 模拟收藏功能
  const handleFavorite = (e, hotelId) => {
    e.stopPropagation();
    Taro.showToast({
      title: '已收藏',
      icon: 'success'
    });
  };

  return (
    <View className="list-page">
      {/* 顶部筛选栏 */}
      <View className="filter-bar">
        <View className="filter-item">
          <Text className="filter-text">价格</Text>
          <Text className="filter-icon">▼</Text>
        </View>
        <View className="filter-item">
          <Text className="filter-text">评分</Text>
          <Text className="filter-icon">▼</Text>
        </View>
        <View className="filter-item">
          <Text className="filter-text">设施</Text>
          <Text className="filter-icon">▼</Text>
        </View>
      </View>

      <ScrollView
        scrollY
        className="scroll-view"
        onScrollToLower={handleLoadMore}
        lowerThreshold={100}
      >
        <View className="hotel-list">
          {hotels.map((hotel) => (
            <View
              key={hotel._id}
              className="hotel-card"
              onClick={() => goToDetail(hotel._id)}
            >
              {/* 酒店图片 */}
              <View className="image-container">
                <Image
                  src={hotel.images?.[0] || 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel'}
                  className="hotel-image"
                  mode="aspectFill"
                />
                <View className="favorite-btn" onClick={(e) => handleFavorite(e, hotel._id)}>
                  <Text className="heart-icon">♡</Text>
                </View>
              </View>

              {/* 酒店信息 */}
              <View className="hotel-info">
                <View className="info-row">
                  <Text className="hotel-name">{hotel.name?.cn || hotel.name}</Text>
                  <View className="rating">
                    <Text className="star-icon">★</Text>
                    <Text className="rating-text">{hotel.rating || '4.8'}</Text>
                  </View>
                </View>

                <View className="hotel-tags">
                  <Text className="tag">{'⭐'.repeat(hotel.starLevel || 4)}</Text>
                  <Text className="tag-divider">·</Text>
                  <Text className="tag">{hotel.type || '精品酒店'}</Text>
                </View>

                <Text className="address">{hotel.address || '市中心'}</Text>

                <View className="price-row">
                  <View className="price-container">
                    <Text className="price-label">¥</Text>
                    <Text className="price">{hotel.rooms?.[0]?.price || 299}</Text>
                    <Text className="price-unit">/晚</Text>
                  </View>
                  {hotel.originalPrice && (
                    <Text className="original-price">¥{hotel.originalPrice}</Text>
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {loading && (
          <View className="loading">
            <View className="loading-spinner"></View>
            <Text className="loading-text">加载中...</Text>
          </View>
        )}
        {!hasMore && hotels.length > 0 && (
          <View className="no-more">
            <Text className="no-more-text">没有更多了</Text>
          </View>
        )}
        {!loading && hotels.length === 0 && (
          <View className="empty">
            <Text className="empty-icon">🏨</Text>
            <Text className="empty-text">暂无酒店数据</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
