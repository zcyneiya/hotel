import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

interface SearchBarProps {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  keyword: string;
  onBack: () => void;
  onDatePress: () => void;
  onKeywordChange: (text: string) => void;
  onSearch: () => void;
}

const getDayMonth = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 3) return '';
  return `${parts[1]}-${parts[2]}`;
};

export const SearchBar: React.FC<SearchBarProps> = ({
  city,
  checkInDate,
  checkOutDate,
  keyword,
  onBack,
  onDatePress,
  onKeywordChange,
  onSearch,
}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={onBack}>
        <Text style={styles.backIcon}>←</Text>
      </TouchableOpacity>
      
      {/* Unified Search Bar */}
      <View style={styles.unifiedSearchBar}>
        {/* Left: City & Date */}
        <TouchableOpacity 
          style={styles.searchLeft}
          activeOpacity={0.7}
          onPress={onDatePress}
        >
          <Text style={styles.cityText} numberOfLines={1}>{city || '城市'}</Text>
          <View style={styles.dateGroup}>
            <Text style={styles.dateText}>{getDayMonth(checkInDate) || '入住'}</Text>
            <Text style={styles.dateText}>{getDayMonth(checkOutDate) || '离店'}</Text>
          </View>
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.verticalDivider} />

        {/* Right: Search Input/Placeholder */}
        <View style={styles.searchRight}>
           <Text style={styles.searchHashTag}>🔍</Text>
           <TextInput
              style={styles.searchInput}
              value={keyword}
              onChangeText={onKeywordChange}
              placeholder="位置/品牌/酒店"
              placeholderTextColor="#9CA3AF"
              returnKeyType="search"
              onSubmitEditing={onSearch} // Trigger search on enter
            />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 60, // Top inset
    paddingBottom: 10,
    zIndex: 11,
  },
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
    fontWeight: '300',
  },
  unifiedSearchBar: {
    flex: 1,
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 22, // Fully rounded
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // Reduced slightly
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  cityText: {
    fontSize: 15, // Slightly smaller
    fontWeight: '600',
    color: '#111827',
    marginRight: 6,
  },
  dateGroup: {
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 28, // Ensure consistent width
  },
  dateText: {
    fontSize: 9, // Smaller font
    color: '#4B5563',
    lineHeight: 11,
  },
  verticalDivider: {
    width: 1,
    height: 24, // Taller divider
    backgroundColor: '#E5E7EB',
    marginRight: 10,
  },
  searchRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchHashTag: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 6,
    fontWeight: 'bold',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '400',
    padding: 0, // remove default padding
  },
});
