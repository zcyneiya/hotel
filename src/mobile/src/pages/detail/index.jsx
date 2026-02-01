import { useState, useEffect } from 'react';
import Taro from '@tarojs/taro';
import { View, Swiper, SwiperItem, Image, Text, ScrollView } from '@tarojs/components';
import { hotelService } from '../../services/api';
import './index.scss';

export default function Detail() {
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <View className="loading">加载中...</View>;
  }

  if (!hotel) {
    return <View className="error">酒店不存在</View>;
  }

  return (
    <ScrollView scrollY className="detail-page">
      {/* 图片轮播 */}
      <Swiper className="image-swiper" circular>
        {(hotel.images?.length > 0 ? hotel.images : ['https://via.placeholder.com/750x400']).map((img, index) => (
          <SwiperItem key={index}>
            <Image src={img} mode="aspectFill" className="hotel-image" />
          </SwiperItem>
        ))}
      </Swiper>

      {/* 基础信息 */}
      <View className="info-section">
        <Text className="hotel-name">{hotel.name.cn}</Text>
        <View className="star-level">
          <Text className="star">{'⭐'.repeat(hotel.starLevel)}</Text>
        </View>
        <Text className="address">{hotel.address}</Text>
        
        {/* 设施 */}
        {hotel.facilities?.length > 0 && (
          <View className="facilities">
            {hotel.facilities.map((facility, index) => (
              <View key={index} className="facility-tag">{facility}</View>
            ))}
          </View>
        )}
      </View>

      {/* 日期信息 */}
      <View className="date-banner">
        <Text>入住日期：待选择 | 离店日期：待选择</Text>
      </View>

      {/* 房型列表 */}
      <View className="rooms-section">
        <Text className="section-title">房型价格</Text>
        {hotel.rooms?.sort((a, b) => a.price - b.price).map((room, index) => (
          <View key={index} className="room-item">
            <View className="room-info">
              <Text className="room-type">{room.type}</Text>
              {room.facilities?.length > 0 && (
                <View className="room-facilities">
                  {room.facilities.map((f, i) => (
                    <Text key={i} className="facility-text">{f}</Text>
                  ))}
                </View>
              )}
            </View>
            <Text className="room-price">¥{room.price}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
