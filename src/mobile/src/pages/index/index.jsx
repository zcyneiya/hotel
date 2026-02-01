import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Swiper, SwiperItem, Image, Input, Button } from '@tarojs/components';
import './index.scss';

export default function Index() {
  const [city, setCity] = useState('北京');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const banners = [
    'https://via.placeholder.com/750x300/667eea/ffffff?text=Banner1',
    'https://via.placeholder.com/750x300/764ba2/ffffff?text=Banner2'
  ];

  const quickTags = ['亲子', '豪华', '免费停车', '游泳池', '健身房'];

  const handleSearch = () => {
    Taro.navigateTo({
      url: `/pages/list/index?city=${city}&keyword=${keyword}&checkIn=${checkInDate}&checkOut=${checkOutDate}`
    });
  };

  const handleDatePicker = (type) => {
    Taro.showToast({
      title: '日历组件待实现',
      icon: 'none'
    });
  };

  return (
    <View className="index-page">
      {/* Banner 轮播 */}
      <Swiper className="banner" autoplay circular>
        {banners.map((item, index) => (
          <SwiperItem key={index}>
            <Image src={item} mode="aspectFill" className="banner-image" />
          </SwiperItem>
        ))}
      </Swiper>

      {/* 查询区域 */}
      <View className="search-section">
        <View className="search-item">
          <View className="label">地点</View>
          <Input
            className="input"
            value={city}
            onInput={(e) => setCity(e.detail.value)}
            placeholder="请输入城市"
          />
        </View>

        <View className="search-item">
          <View className="label">关键字</View>
          <Input
            className="input"
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
            placeholder="酒店名称"
          />
        </View>

        <View className="search-item" onClick={() => handleDatePicker('checkIn')}>
          <View className="label">入住日期</View>
          <View className="input">{checkInDate || '选择日期'}</View>
        </View>

        <View className="search-item" onClick={() => handleDatePicker('checkOut')}>
          <View className="label">离店日期</View>
          <View className="input">{checkOutDate || '选择日期'}</View>
        </View>

        {/* 快捷标签 */}
        <View className="quick-tags">
          {quickTags.map((tag, index) => (
            <View key={index} className="tag">{tag}</View>
          ))}
        </View>

        <Button className="search-btn" type="primary" onClick={handleSearch}>
          查询酒店
        </Button>
      </View>
    </View>
  );
}
