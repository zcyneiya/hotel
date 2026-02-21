import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import * as Location from 'expo-location';
import DateRangePicker from '../components/DateRangePicker';
import { hotelService } from '../services/hotelService';
import { getImageUrl } from '../utils/imageUrl';
import { Hotel } from '../types/hotel';
import HomeBanner from '../components/home/HomeBanner';
import HomeSearchCard from '../components/home/HomeSearchCard';
import HomeDestinations from '../components/home/HomeDestinations';

const { width } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 3000;

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

type BannerConfig = {
  id: number;
  title: string;
  city: string;
  hotelName: string;
  fallbackImage: string;
};

type BannerItem = {
  id: number;
  title: string;
  image: string;
  hotelId: string;
};

const bannerConfigs: BannerConfig[] = [
  {
    id: 1,
    title: '北京王府井希尔顿酒店',
    city: '北京',
    hotelName: '北京王府井希尔顿酒店',
    fallbackImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop',
  },
  {
    id: 2,
    title: '上海法租界老洋房民宿',
    city: '上海',
    hotelName: '上海法租界老洋房民宿',
    fallbackImage: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=400&fit=crop',
  },
  {
    id: 3,
    title: '杭州西子湖四季酒店',
    city: '杭州',
    hotelName: '杭州西子湖四季酒店',
    fallbackImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=400&fit=crop',
  },
];

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const bannerScrollRef = useRef<ScrollView>(null);
  const [banners, setBanners] = useState<BannerItem[]>(
    bannerConfigs.map((config) => ({
      id: config.id,
      title: config.title,
      image: config.fallbackImage,
      hotelId: '',
    }))
  );
  const displayBanners = banners.length > 0 ? [...banners, banners[0]] : [];

  useEffect(() => {
    loadBannerHotels();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentBannerIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        bannerScrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [banners.length]);

  useEffect(() => {
    if (currentBannerIndex > banners.length) {
      setCurrentBannerIndex(0);
      bannerScrollRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [banners.length, currentBannerIndex]);

  const getHotelCnName = (hotelName: Hotel['name']): string => {
    if (typeof hotelName === 'string') return hotelName;
    return hotelName?.cn || hotelName?.en || '';
  };

  const loadBannerHotels = async () => {
    try {
      const mappedBanners = await Promise.all(
        bannerConfigs.map(async (config) => {
          const response = await hotelService.getHotels({
            city: config.city,
            keyword: config.hotelName,
            page: 1,
            limit: 10,
          });

          const hotelList: Hotel[] = response?.data?.hotels || [];
          const matchedHotel =
            hotelList.find((item) => getHotelCnName(item.name) === config.hotelName) || hotelList[0];

          return {
            id: config.id,
            title: config.title,
            image: getImageUrl(matchedHotel?.images?.[0] || config.fallbackImage),
            hotelId: matchedHotel?._id || '',
          };
        })
      );

      setBanners(mappedBanners);
    } catch (error) {
      console.warn('Load banner hotels failed:', error);
    }
  };

  // 快捷标签 - 对应数据库中的酒店标签
  const quickTags = ['停车场', '游泳池', '健身房', '餐厅', '免费WiFi'];

  // 推荐目的地
  const destinations = [
    {
      id: 1,
      name: '北京',
      image: require('../../assets/beijing.jpg'),
      desc: '历史文化名城',
    },
    {
      id: 2,
      name: '上海',
      image: require('../../assets/shanghai.jpg'),
      desc: '国际大都市',
    },
    {
      id: 3,
      name: '杭州',
      image: require('../../assets/hangzhou.jpg'),
      desc: '人间天堂',
    },
    {
      id: 4,
      name: '成都',
      image: require('../../assets/chengdu.jpg'),
      desc: '休闲之都',
    },
  ];

  // 获取当前位置
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('提示', '需要位置权限才能使用定位功能');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.length > 0) {
        const city = address[0].city || address[0].region || '';
        setLocation(city);
        //Alert.alert('定位成功', `当前位置: ${city}`);
      }
    } catch (error) {
      Alert.alert('定位失败', '无法获取当前位置');
    }
  };

  // Banner 点击 - 跳转到酒店详情页
  const handleBannerClick = (hotelId: string) => {
    if (!hotelId) {
      Alert.alert('提示', '酒店信息加载中，请稍后再试');
      return;
    }
    navigation.navigate('Detail', { id: hotelId });
  };

  // 标签切换
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // 搜索
  const handleSearch = () => {
    if (!location) {
      Alert.alert('提示', '请输入目的地');
      return;
    }

    navigation.navigate('List', {
      city: location,
      keyword,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      priceRange,
      tags: selectedTags.join(','),
    });
  };

  // 快速跳转到城市
  const goToCity = (city: string) => {
    navigation.navigate('List', { city });
  };

  // 处理日期选择
  const handleDateConfirm = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <HomeBanner
        banners={banners}
        displayBanners={displayBanners}
        currentBannerIndex={currentBannerIndex}
        bannerScrollRef={bannerScrollRef}
        onBannerPress={handleBannerClick}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          if (newIndex === banners.length) {
            bannerScrollRef.current?.scrollTo({ x: 0, animated: false });
            setCurrentBannerIndex(0);
            return;
          }
          setCurrentBannerIndex(newIndex);
        }}
      />

      <HomeSearchCard
        location={location}
        keyword={keyword}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        priceRange={priceRange}
        selectedTags={selectedTags}
        quickTags={quickTags}
        onLocationChange={setLocation}
        onKeywordChange={setKeyword}
        onPriceRangeChange={setPriceRange}
        onLocationPress={getCurrentLocation}
        onDatePress={() => setShowDatePicker(true)}
        onToggleTag={toggleTag}
        onSearch={handleSearch}
      />

      <HomeDestinations destinations={destinations} onPressCity={goToCity} />

      {/* 底部提示 */}
      <View style={styles.footerTip}>
        <Text style={styles.tipIcon}>✨</Text>
        <Text style={styles.tipText}>发现更多精彩住宿体验</Text>
      </View>

      {/* 日期选择器 */}
      <DateRangePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={handleDateConfirm}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  bannerSection: {
    height: 200,
    backgroundColor: '#fff',
  },
  bannerScroll: {
    height: 200,
  },
  bannerImage: {
    width: width,
    height: 200,
    resizeMode: 'cover',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 16,
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bannerDotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  bannerDotActive: {
    width: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  searchCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  searchItem: {
    marginBottom: 16,
  },
  itemLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  itemContent: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 15,
    color: '#333',
  },
  locationBtn: {
    padding: 8,
  },
  locationIcon: {
    fontSize: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateItem: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
  },
  dateDivider: {
    marginHorizontal: 12,
    fontSize: 18,
    color: '#666',
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  dateValueSelected: {
    color: '#333',
  },
  tagsSection: {
    marginBottom: 20,
  },
  tagsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  tagItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    margin: 4,
  },
  tagActive: {
    backgroundColor: '#FF385C',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextActive: {
    color: '#fff',
  },
  searchBtn: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerTip: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  tipIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#999',
  },
});

export default HomeScreen;
