import { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Image, Picker, Swiper, SwiperItem, Input } from '@tarojs/components';
import './index.scss';

export default function Index() {
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [starLevel, setStarLevel] = useState('不限');
  const [priceRange, setPriceRange] = useState('不限');
  const [selectedTags, setSelectedTags] = useState([]);

  // 顶部 Banner 广告
  const banners = [
    { 
      id: 1, 
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop',
      hotelId: '1',
      title: '豪华五星酒店'
    },
    { 
      id: 2, 
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=400&fit=crop',
      hotelId: '2',
      title: '精品商务酒店'
    },
    { 
      id: 3, 
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=400&fit=crop',
      hotelId: '3',
      title: '海景度假酒店'
    }
  ];

  // 星级选项
  const starOptions = ['不限', '三星级', '四星级', '五星级'];
  
  // 价格区间选项
  const priceOptions = ['不限', '0-200元', '200-500元', '500-1000元', '1000元以上'];

  // 快捷标签
  const quickTags = ['亲子', '豪华', '免费停车', '游泳池', '健身房', '商务', '度假', '温泉'];

  // 推荐目的地（使用 Unsplash 免费图片）
  const destinations = [
    { 
      id: 1, 
      name: '北京', 
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=400&fit=crop',
      desc: '历史文化名城' 
    },
    { 
      id: 2, 
      name: '上海', 
      image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=600&h=400&fit=crop',
      desc: '国际大都市' 
    },
    { 
      id: 3, 
      name: '杭州', 
      image: 'https://images.unsplash.com/photo-1559564484-e48bf5f6c69b?w=600&h=400&fit=crop',
      desc: '人间天堂' 
    },
    { 
      id: 4, 
      name: '成都', 
      image: 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=600&h=400&fit=crop',
      desc: '休闲之都' 
    }
  ];

  // Banner 点击跳转
  const handleBannerClick = (hotelId) => {
    Taro.navigateTo({
      url: `/pages/detail/index?id=${hotelId}`
    });
  };

  // 获取当前定位
  const handleGetLocation = () => {
    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        // 这里应该调用逆地理编码API获取城市名
        setLocation('当前位置');
        Taro.showToast({
          title: '定位成功',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '定位失败，请手动输入',
          icon: 'none'
        });
      }
    });
  };

  // 日期选择
  const handleDateChange = (type, e) => {
    if (type === 'checkIn') {
      setCheckInDate(e.detail.value);
    } else {
      setCheckOutDate(e.detail.value);
    }
  };

  // 标签切换
  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 搜索
  const handleSearch = () => {
    if (!location) {
      Taro.showToast({
        title: '请输入目的地',
        icon: 'none'
      });
      return;
    }

    const params = {
      city: location,
      keyword,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      starLevel: starLevel !== '不限' ? starLevel : '',
      priceRange: priceRange !== '不限' ? priceRange : '',
      tags: selectedTags.join(',')
    };

    const queryString = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');

    Taro.navigateTo({
      url: `/pages/list/index?${queryString}`
    });
  };

  // 快速跳转到城市
  const goToCity = (city) => {
    Taro.navigateTo({
      url: `/pages/list/index?city=${city}`
    });
  };

  return (
    <View className="index-page">
      {/* 顶部 Banner 轮播 */}
      <View className="banner-section">
        <Swiper 
          className="banner-swiper" 
          autoplay 
          circular 
          interval={5000}
          indicatorDots 
          indicatorColor="rgba(255,255,255,0.5)" 
          indicatorActiveColor="#fff"
        >
          {banners.map((banner) => (
            <SwiperItem key={banner.id}>
              <View className="banner-item" onClick={() => handleBannerClick(banner.hotelId)}>
                <Image src={banner.image} mode="aspectFill" className="banner-image" />
                <View className="banner-overlay">
                  <View className="banner-title">{banner.title}</View>
                </View>
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </View>

      {/* 搜索卡片 */}
      <View className="search-card">
        <View className="card-title">开始你的旅程</View>

        {/* 地点输入 */}
        <View className="search-item">
          <View className="item-label">
            <View className="label-icon">📍</View>
            <View className="label-text">目的地</View>
          </View>
          <View className="item-content">
            <View className="location-row">
              <Input
                className="location-input"
                value={location}
                onInput={(e) => setLocation(e.detail.value)}
                placeholder="请输入城市名称"
                placeholderClass="input-placeholder"
              />
              <View className="locate-btn" onClick={handleGetLocation}>
                <View className="locate-icon">⊙</View>
                <View className="locate-text">定位</View>
              </View>
            </View>
          </View>
        </View>

        {/* 关键字搜索 */}
        <View className="search-item">
          <View className="item-label">
            <View className="label-icon">🔍</View>
            <View className="label-text">关键字</View>
          </View>
          <View className="item-content">
            <Input
              className="search-input"
              value={keyword}
              onInput={(e) => setKeyword(e.detail.value)}
              placeholder="酒店名称、品牌等"
              placeholderClass="input-placeholder"
            />
          </View>
        </View>

        {/* 日期选择 */}
        <View className="date-row">
          <Picker mode="date" value={checkInDate} onChange={(e) => handleDateChange('checkIn', e)}>
            <View className="date-item">
              <View className="date-label">入住</View>
              <View className="date-value">{checkInDate || '选择日期'}</View>
            </View>
          </Picker>
          <View className="date-divider">→</View>
          <Picker mode="date" value={checkOutDate} onChange={(e) => handleDateChange('checkOut', e)}>
            <View className="date-item">
              <View className="date-label">离店</View>
              <View className="date-value">{checkOutDate || '选择日期'}</View>
            </View>
          </Picker>
        </View>

        {/* 筛选条件 */}
        <View className="filter-row">
          <Picker mode="selector" range={starOptions} onChange={(e) => setStarLevel(starOptions[e.detail.value])}>
            <View className="filter-item">
              <View className="filter-label">星级</View>
              <View className="filter-value">{starLevel}</View>
              <View className="filter-arrow">▼</View>
            </View>
          </Picker>
          <Picker mode="selector" range={priceOptions} onChange={(e) => setPriceRange(priceOptions[e.detail.value])}>
            <View className="filter-item">
              <View className="filter-label">价格</View>
              <View className="filter-value">{priceRange}</View>
              <View className="filter-arrow">▼</View>
            </View>
          </Picker>
        </View>

        {/* 快捷标签 */}
        <View className="tags-section">
          <View className="tags-label">快捷筛选</View>
          <View className="tags-grid">
            {quickTags.map((tag) => (
              <View
                key={tag}
                className={`tag-item ${selectedTags.includes(tag) ? 'tag-active' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
              </View>
            ))}
          </View>
        </View>

        {/* 搜索按钮 */}
        <View className="search-btn" onClick={handleSearch}>
          <View className="btn-text">搜索酒店</View>
        </View>
      </View>

      {/* 热门目的地 */}
      <View className="content">
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
