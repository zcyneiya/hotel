import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface FilterBarProps {
  activeTab: string | null;
  onTabChange: (tab: string | null) => void;
  priceRange: string;
  onPriceChange: (val: string) => void;
  ratingFilter: string;
  onRatingChange: (val: string) => void;
  facilitiesFilter: string[];
  onFacilitiesChange: (val: string[]) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeTab, 
  onTabChange,
  priceRange, 
  onPriceChange,
  ratingFilter, 
  onRatingChange,
  facilitiesFilter, 
  onFacilitiesChange
}) => {
  
  const toggleTab = (tab: string) => {
    if (activeTab === tab) {
        onTabChange(null);
    } else {
        onTabChange(tab);
    }
  };

  const toggleFacility = (facility: string) => {
    if (facilitiesFilter.includes(facility)) {
        onFacilitiesChange(facilitiesFilter.filter(f => f !== facility));
    } else {
        onFacilitiesChange([...facilitiesFilter, facility]);
    }
  };

  // 价格筛选选项
  const priceOptions = [
    { label: '不限', value: '' },
    { label: '0-200元', value: '0-200' },
    { label: '200-500元', value: '200-500' },
    { label: '500-1000元', value: '500-1000' },
    { label: '1000元以上', value: '1000-' },
  ];

  // 评分筛选选项
  const ratingOptions = [
    { label: '不限', value: '' },
    { label: '4.5分以上', value: '4.5' },
    { label: '4.0分以上', value: '4.0' },
    { label: '3.5分以上', value: '3.5' },
  ];

  // 设施筛选选项
  const facilitiesOptions = ['免费WiFi', '停车场', '游泳池', '健身房', '餐厅'];

  const getPriceLabel = () => {
    const option = priceOptions.find(o => o.value === priceRange);
    return option && option.value ? option.label : '价格';
  };

  const getRatingLabel = () => {
    const option = ratingOptions.find(o => o.value === ratingFilter);
    return option && option.value ? option.label : '评分';
  };

  const renderDropdown = () => {
    if (!activeTab) return null;

    if (activeTab === 'price') {
        return (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdownContent}>
                {priceOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                        onPriceChange(option.value);
                        onTabChange(null); 
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        priceRange === option.value && styles.dropdownItemTextActive,
                      ]}>
                      {option.label}
                    </Text>
                    {priceRange === option.value && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.dropdownOverlay} 
                activeOpacity={1} 
                onPress={() => onTabChange(null)}
              />
            </View>
          );
    }

    if (activeTab === 'rating') {
        return (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdownContent}>
                {ratingOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.dropdownItem}
                    onPress={() => {
                        onRatingChange(option.value);
                        onTabChange(null);
                    }}>
                    <Text
                      style={[
                        styles.dropdownItemText,
                        ratingFilter === option.value && styles.dropdownItemTextActive,
                      ]}>
                      {option.label}
                    </Text>
                    {ratingFilter === option.value && (
                      <Text style={styles.checkIcon}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity 
                style={styles.dropdownOverlay} 
                activeOpacity={1} 
                onPress={() => onTabChange(null)}
              />
            </View>
          );
    }

    if (activeTab === 'facilities') {
        return (
            <View style={styles.dropdownContainer}>
              <View style={styles.dropdownContent}>
                <View style={styles.facilitiesGrid}>
                  {facilitiesOptions.map((facility) => (
                    <TouchableOpacity
                      key={facility}
                      style={[
                        styles.facilityTag,
                        facilitiesFilter.includes(facility) && styles.facilityTagActive,
                      ]}
                      onPress={() => toggleFacility(facility)}>
                      <Text
                        style={[
                          styles.facilityTagText,
                          facilitiesFilter.includes(facility) && styles.facilityTagTextActive,
                        ]}>
                        {facility}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.dropdownOverlay} 
                activeOpacity={1} 
                onPress={() => onTabChange(null)}
              />
            </View>
          );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.filterBar, { zIndex: activeTab ? 1001 : 1 }]}>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => toggleTab('price')}>
          <Text 
            style={[styles.filterText, (priceRange || activeTab === 'price') && styles.filterTextActive]}
            numberOfLines={1}>
            {getPriceLabel()}
          </Text>
          <Text style={[styles.filterIcon, activeTab === 'price' && styles.filterIconActive]}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => toggleTab('rating')}>
          <Text 
            style={[styles.filterText, (ratingFilter || activeTab === 'rating') && styles.filterTextActive]}
            numberOfLines={1}>
            {getRatingLabel()}
          </Text>
          <Text style={[styles.filterIcon, activeTab === 'rating' && styles.filterIconActive]}>▼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.filterItem}
          onPress={() => toggleTab('facilities')}>
          <Text style={[styles.filterText, (facilitiesFilter.length > 0 || activeTab === 'facilities') && styles.filterTextActive]}>
            设施
            {facilitiesFilter.length > 0 && ` (${facilitiesFilter.length})`}
          </Text>
          <Text style={[styles.filterIcon, activeTab === 'facilities' && styles.filterIconActive]}>▼</Text>
        </TouchableOpacity>
      </View>
      
      {renderDropdown()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    // zIndex is handled by the parent view
    position: 'relative',
  },
  filterItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    marginRight: 4,
  },
  filterTextActive: {
    color: '#FF385C',
    fontWeight: '600',
  },
  filterIcon: {
    fontSize: 10,
    color: '#666',
  },
  filterIconActive: {
    color: '#FF385C',
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%', // Position exactly below the filter bar
    left: 0,
    right: 0,
    height: Dimensions.get('window').height - 150, // Limit height to avoid overflow issues
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownContent: {
    backgroundColor: '#fff',
    maxHeight: 400,
    paddingBottom: 20,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  dropdownOverlay: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333',
  },
  dropdownItemTextActive: {
    color: '#FF385C',
    fontWeight: 'bold',
  },
  checkIcon: {
    fontSize: 18,
    color: '#FF385C',
    fontWeight: 'bold',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  facilityTag: {
    width: '30%',
    margin: '1.5%',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  facilityTagActive: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF385C',
  },
  facilityTagText: {
    fontSize: 14,
    color: '#666',
  },
  facilityTagTextActive: {
    color: '#FF385C',
    fontWeight: 'bold',
  },
});
