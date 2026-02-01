import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, ScrollView, Text } from '@tarojs/components';
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

  return (
    <View className="list-page">
      <ScrollView
        scrollY
        className="scroll-view"
        onScrollToLower={handleLoadMore}
        lowerThreshold={50}
      >
        {hotels.map((hotel) => (
          <View
            key={hotel._id}
            className="hotel-item"
            onClick={() => goToDetail(hotel._id)}
          >
            <View className="hotel-info">
              <Text className="hotel-name">{hotel.name.cn}</Text>
              <View className="hotel-meta">
                <Text className="star">{'⭐'.repeat(hotel.starLevel)}</Text>
                <Text className="address">{hotel.address}</Text>
              </View>
              <Text className="price">¥{hotel.rooms[0]?.price || 0} 起</Text>
            </View>
          </View>
        ))}
        
        {loading && <View className="loading">加载中...</View>}
        {!hasMore && <View className="no-more">没有更多了</View>}
      </ScrollView>
    </View>
  );
}
