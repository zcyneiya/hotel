import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Swiper, SwiperItem, Image, Text, ScrollView } from '@tarojs/components';
import { hotelService } from '../../services/api';
import './index.scss';

export default function Detail() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const { id } = instance.router.params;
    fetchHotel(id);
  }, []);

  const fetchHotel = async (id) => {
    try {
      const res = await hotelService.getHotelById(id);
      setHotel(res.data);
    } catch (error) {
      Taro.showToast({
        title: '加载失败',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
    Taro.showToast({
      title: isFavorite ? '已取消收藏' : '已收藏',
      icon: 'success'
    });
  };

  const handleBook = (room) => {
    Taro.showToast({
      title: '预订功能开发中',
      icon: 'none'
    });
  };

  if (loading) {
    return (
      <View className="loading-page">
        <View className="loading-spinner"></View>
        <Text className="loading-text">加载中...</Text>
      </View>
    );
  }

  if (!hotel) {
    return (
      <View className="error-page">
        <Text className="error-icon">🏨</Text>
        <Text className="error-text">酒店不存在</Text>
      </View>
    );
  }

  return (
    <View className="detail-page">
      <ScrollView scrollY className="scroll-container">
        {/* 图片轮播 */}
        <View className="image-section">
          <Swiper className="image-swiper" circular indicatorDots indicatorColor="rgba(255,255,255,0.5)" indicatorActiveColor="#fff">
            {(hotel.images?.length > 0 ? hotel.images : ['https://via.placeholder.com/750x500/667eea/ffffff?text=Hotel']).map((img, index) => (
              <SwiperItem key={index}>
                <Image src={img} mode="aspectFill" className="hotel-image" />
              </SwiperItem>
            ))}
          </Swiper>
          
          {/* 返回和收藏按钮 */}
          <View className="top-actions">
            <View className="action-btn" onClick={() => Taro.navigateBack()}>
              <Text className="action-icon">←</Text>
            </View>
            <View className="action-btn" onClick={handleFavorite}>
              <Text className="action-icon">{isFavorite ? '♥' : '♡'}</Text>
            </View>
          </View>
        </View>

        {/* 酒店基本信息 */}
        <View className="info-section">
          <View className="title-row">
            <Text className="hotel-name">{hotel.name?.cn || hotel.name}</Text>
            <View className="rating-badge">
              <Text className="star-icon">★</Text>
              <Text className="rating-text">{hotel.rating || '4.8'}</Text>
            </View>
          </View>

          <View className="meta-row">
            <Text className="star-level">{'⭐'.repeat(hotel.starLevel || 4)}</Text>
            <Text className="divider">·</Text>
            <Text className="hotel-type">{hotel.type || '精品酒店'}</Text>
          </View>

          <View className="address-row">
            <Text className="location-icon">📍</Text>
            <Text className="address">{hotel.address || '市中心'}</Text>
          </View>
        </View>

        {/* 分隔线 */}
        <View className="divider-line"></View>

        {/* 设施服务 */}
        {hotel.facilities?.length > 0 && (
          <View className="facilities-section">
            <Text className="section-title">设施与服务</Text>
            <View className="facilities-grid">
              {hotel.facilities.map((facility, index) => (
                <View key={index} className="facility-item">
                  <Text className="facility-icon">✓</Text>
                  <Text className="facility-name">{facility}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className="divider-line"></View>

        {/* 房型列表 */}
        <View className="rooms-section">
          <Text className="section-title">选择房型</Text>
          {hotel.rooms?.sort((a, b) => a.price - b.price).map((room, index) => (
            <View key={index} className="room-card">
              <View className="room-header">
                <Text className="room-type">{room.type}</Text>
                {room.area && <Text className="room-area">{room.area}㎡</Text>}
              </View>

              {room.facilities?.length > 0 && (
                <View className="room-facilities">
                  {room.facilities.slice(0, 3).map((f, i) => (
                    <Text key={i} className="room-facility">• {f}</Text>
                  ))}
                </View>
              )}

              <View className="room-footer">
                <View className="price-container">
                  <Text className="price-label">¥</Text>
                  <Text className="room-price">{room.price}</Text>
                  <Text className="price-unit">/晚</Text>
                </View>
                <View className="book-btn" onClick={() => handleBook(room)}>
                  <Text className="book-text">预订</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* 底部占位 */}
        <View className="bottom-spacer"></View>
      </ScrollView>
    </View>
  );
}
