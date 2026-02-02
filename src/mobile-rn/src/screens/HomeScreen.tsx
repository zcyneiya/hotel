import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

const {width} = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [location, setLocation] = useState('');
  const [keyword, setKeyword] = useState('');
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [starLevel, setStarLevel] = useState('不限');
  const [priceRange, setPriceRange] = useState('不限');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Banner 数据
  const banners = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop',
      hotelId: '1',
      title: '豪华五星酒店',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=400&fit=crop',
      hotelId: '2',
      title: '精品商务酒店',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=400&fit=crop',
      hotelId: '3',
      title: '海景度假酒店',
    },
  ];

  // 快捷标签
  const quickTags = ['亲子', '豪华', '免费停车', '游泳池', '健身房', '商务', '度假', '温泉'];

  // 推荐目的地
  const destinations = [
    {
      id: 1,
      name: '北京',
      image: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=400&fit=crop',
      desc: '历史文化名城',
    },
    {
      id: 2,
      name: '上海',
      image: 'https://images.unsplash.com/photo-1548919973-5cef591cdbc9?w=600&h=400&fit=crop',
      desc: '国际大都市',
    },
    {
      id: 3,
      name: '杭州',
      image: 'https://images.unsplash.com/photo-1559564484-e48bf5f6c69b?w=600&h=400&fit=crop',
      desc: '人间天堂',
    },
    {
      id: 4,
      name: '成都',
      image: 'https://images.unsplash.com/photo-1590859808308-3d2d9c515b1a?w=600&h=400&fit=crop',
      desc: '休闲之都',
    },
  ];

  // Banner 点击
  const handleBannerClick = (hotelId: string) => {
    navigation.navigate('Detail', {id: hotelId});
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
      starLevel: starLevel !== '不限' ? starLevel : undefined,
      priceRange: priceRange !== '不限' ? priceRange : undefined,
      tags: selectedTags.join(','),
    });
  };

  // 快速跳转到城市
  const goToCity = (city: string) => {
    navigation.navigate('List', {city});
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Banner 轮播 */}
      <View style={styles.bannerSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScroll}>
          {banners.map(banner => (
            <TouchableOpacity
              key={banner.id}
              onPress={() => handleBannerClick(banner.hotelId)}
              activeOpacity={0.9}>
              <Image source={{uri: banner.image}} style={styles.bannerImage} />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 搜索卡片 */}
      <View style={styles.searchCard}>
        <Text style={styles.cardTitle}>开始你的旅程</Text>

        {/* 目的地输入 */}
        <View style={styles.searchItem}>
          <View style={styles.itemLabel}>
            <Text style={styles.labelIcon}>📍</Text>
            <Text style={styles.labelText}>目的地</Text>
          </View>
          <View style={styles.itemContent}>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="请输入城市名称"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* 关键字搜索 */}
        <View style={styles.searchItem}>
          <View style={styles.itemLabel}>
            <Text style={styles.labelIcon}>🔍</Text>
            <Text style={styles.labelText}>关键字</Text>
          </View>
          <View style={styles.itemContent}>
            <TextInput
              style={styles.input}
              value={keyword}
              onChangeText={setKeyword}
              placeholder="酒店名称、品牌等"
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* 日期选择 */}
        <View style={styles.dateRow}>
          <TouchableOpacity style={styles.dateItem}>
            <Text style={styles.dateLabel}>入住</Text>
            <Text style={styles.dateValue}>
              {checkInDate || '选择日期'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.dateDivider}>→</Text>
          <TouchableOpacity style={styles.dateItem}>
            <Text style={styles.dateLabel}>离店</Text>
            <Text style={styles.dateValue}>
              {checkOutDate || '选择日期'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 快捷标签 */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>快捷筛选</Text>
          <View style={styles.tagsGrid}>
            {quickTags.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[
                  styles.tagItem,
                  selectedTags.includes(tag) && styles.tagActive,
                ]}
                onPress={() => toggleTag(tag)}>
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag) && styles.tagTextActive,
                  ]}>
                  {tag}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 搜索按钮 */}
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>搜索酒店</Text>
        </TouchableOpacity>
      </View>

      {/* 热门目的地 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>热门目的地</Text>
        <View style={styles.destinationList}>
          {destinations.map(dest => (
            <TouchableOpacity
              key={dest.id}
              style={styles.destinationCard}
              onPress={() => goToCity(dest.name)}
              activeOpacity={0.8}>
              <Image
                source={{uri: dest.image}}
                style={styles.destImage}
              />
              <View style={styles.destOverlay}>
                <Text style={styles.destName}>{dest.name}</Text>
                <Text style={styles.destDesc}>{dest.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 底部提示 */}
      <View style={styles.footerTip}>
        <Text style={styles.tipIcon}>✨</Text>
        <Text style={styles.tipText}>发现更多精彩住宿体验</Text>
      </View>
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
  searchCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
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
  },
  input: {
    height: 44,
    fontSize: 15,
    color: '#333',
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
    color: '#333',
    fontWeight: '500',
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  destinationList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  destinationCard: {
    width: (width - 48) / 2,
    height: 160,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  destImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  destOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
  },
  destName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  destDesc: {
    color: '#fff',
    fontSize: 12,
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
