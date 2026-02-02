import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Input } from '@tarojs/components';
import './index.scss';

export default function Index() {
  const [searchText, setSearchText] = useState('');

  // 推荐目的地
  const destinations = [
    { id: 1, name: '北京', image: 'https://via.placeholder.com/300x200/667eea/ffffff?text=Beijing', desc: '历史文化名城' },
    { id: 2, name: '上海', image: 'https://via.placeholder.com/300x200/764ba2/ffffff?text=Shanghai', desc: '国际大都市' },
    { id: 3, name: '杭州', image: 'https://via.placeholder.com/300x200/f093fb/ffffff?text=Hangzhou', desc: '人间天堂' },
    { id: 4, name: '成都', image: 'https://via.placeholder.com/300x200/4facfe/ffffff?text=Chengdu', desc: '休闲之都' }
  ];

  // 热门酒店类型
  const hotelTypes = [
    { icon: '🏨', name: '精品酒店', color: '#FF385C' },
    { icon: '🏡', name: '民宿', color: '#00A699' },
    { icon: '🏰', name: '度假村', color: '#FC642D' },
    { icon: '🏢', name: '商务酒店', color: '#484848' }
  ];

  const handleSearch = () => {
    if (!searchText.trim()) {
      Taro.showToast({
        title: '请输入搜索内容',
        icon: 'none'
      });
      return;
    }
    Taro.navigateTo({
      url: `/pages/list/index?keyword=${searchText}`
    });
  };

  const goToCity = (city) => {
    Taro.navigateTo({
      url: `/pages/list/index?city=${city}`
    });
  };

  return (
    <View className="index-page">
      {/* 顶部搜索栏 */}
      <View className="header">
        <View className="search-bar">
          <View className="search-icon">🔍</View>
          <Input
            className="search-input"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
            onConfirm={handleSearch}
            placeholder="搜索目的地或酒店"
            placeholderClass="search-placeholder"
          />
        </View>
      </View>

      {/* 主内容区 */}
      <View className="content">
        {/* 酒店类型 */}
        <View className="section">
          <View className="section-title">探索住宿类型</View>
          <View className="type-grid">
            {hotelTypes.map((type, index) => (
              <View key={index} className="type-card" style={{ borderColor: type.color }}>
                <View className="type-icon">{type.icon}</View>
                <View className="type-name">{type.name}</View>
              </View>
            ))}
          </View>
        </View>

        {/* 热门目的地 */}
        <View className="section">
          <View className="section-title">热门目的地</View>
          <View className="destination-list">
            {destinations.map((dest) => (
              <View
                key={dest.id}
                className="destination-card"
                onClick={() => goToCity(dest.name)}
              >
                <Image src={dest.image} className="dest-image" mode="aspectFill" />
                <View className="dest-overlay">
                  <View className="dest-name">{dest.name}</View>
                  <View className="dest-desc">{dest.desc}</View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 底部提示 */}
        <View className="footer-tip">
          <View className="tip-icon">✨</View>
          <View className="tip-text">发现更多精彩住宿体验</View>
        </View>
      </View>
    </View>
  );
}
