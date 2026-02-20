import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface HomeSearchCardProps {
  location: string;
  keyword: string;
  checkInDate: string;
  checkOutDate: string;
  priceRange: string;
  selectedTags: string[];
  quickTags: string[];
  onLocationChange: (value: string) => void;
  onKeywordChange: (value: string) => void;
  onPriceRangeChange: (value: string) => void;
  onLocationPress: () => void;
  onDatePress: () => void;
  onToggleTag: (tag: string) => void;
  onSearch: () => void;
}

const HomeSearchCard: React.FC<HomeSearchCardProps> = ({
  location,
  keyword,
  checkInDate,
  checkOutDate,
  priceRange,
  selectedTags,
  quickTags,
  onLocationChange,
  onKeywordChange,
  onPriceRangeChange,
  onLocationPress,
  onDatePress,
  onToggleTag,
  onSearch,
}) => {
  const priceOptions = [
    { label: '不限', value: '' },
    { label: '0-200元', value: '0-200' },
    { label: '200-500元', value: '200-500' },
    { label: '500-1000元', value: '500-1000' },
    { label: '1000元以上', value: '1000-' },
  ];

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[1]}月${parts[2]}日`;
  };

  return (
    <View style={styles.searchCard}>
      <Text style={styles.cardTitle}>开始你的旅程</Text>

      <View style={styles.searchItem}>
        <View style={styles.itemLabel}>
          <Text style={styles.labelIcon}>📍</Text>
          <Text style={styles.labelText}>目的地</Text>
        </View>
        <View style={styles.itemContent}>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={onLocationChange}
            placeholder="请输入城市名称"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.locationBtn} onPress={onLocationPress}>
            <Text style={styles.locationIcon}>📍</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchItem}>
        <View style={styles.itemLabel}>
          <Text style={styles.labelIcon}>🔍</Text>
          <Text style={styles.labelText}>关键字</Text>
        </View>
        <View style={styles.itemContent}>
          <TextInput
            style={styles.input}
            value={keyword}
            onChangeText={onKeywordChange}
            placeholder="酒店名称、品牌等"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <View style={styles.dateRow}>
        
        <TouchableOpacity style={styles.dateItem} onPress={onDatePress}>
          <Text style={styles.dateLabel}>入住</Text>
          <Text style={[styles.dateValue, checkInDate && styles.dateValueSelected]}>
            {checkInDate ? formatDateDisplay(checkInDate) : '选择日期'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.dateDivider}>→</Text>
        <TouchableOpacity style={styles.dateItem} onPress={onDatePress}>
          <Text style={styles.dateLabel}>离店</Text>
          <Text style={[styles.dateValue, checkOutDate && styles.dateValueSelected]}>
            {checkOutDate ? formatDateDisplay(checkOutDate) : '选择日期'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tagsSection}>
        <Text style={styles.tagsLabel}>价格区间</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.priceTagsScrollContent}>
          {priceOptions.map(option => (
            <TouchableOpacity
              key={option.value || 'all'}
              style={[styles.tagItem, priceRange === option.value && styles.tagActive]}
              onPress={() => onPriceRangeChange(option.value)}>
              <Text style={[styles.tagText, priceRange === option.value && styles.tagTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.tagsSection}>
        <Text style={styles.tagsLabel}>快捷筛选</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.quickTagsScrollContent}>
          {quickTags.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagItem, selectedTags.includes(tag) && styles.tagActive]}
              onPress={() => onToggleTag(tag)}>
              <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity style={styles.searchBtn} onPress={onSearch}>
        <Text style={styles.searchBtnText}>搜索酒店</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
  priceTagsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  quickTagsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
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
});

export default HomeSearchCard;
