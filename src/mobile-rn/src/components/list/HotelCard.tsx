import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Hotel } from '../../types/hotel';

interface HotelCardProps {
  item: Hotel;
  onPress: (id: string) => void;
  onFavorite: (id: string) => void;
}

const HotelCard: React.FC<HotelCardProps> = ({ item, onPress, onFavorite }) => {
  const minPrice = item.rooms && item.rooms.length > 0
    ? Math.min(...item.rooms.map(r => r.price))
    : 299;
  const hasMultipleRooms = item.rooms && item.rooms.length > 1;

  const getHotelName = (name: Hotel['name']): string => {
    if (typeof name === 'string') {
      return name;
    }
    return name.cn || name.en || '未知酒店';
  };
  
  // 附近信息：景点、交通、商场
  const nearbyInfo = [
    ...(item.nearbyAttractions || []),
    ...(item.nearbyTransport || []),
    ...(item.nearbyMalls || [])
  ].slice(0, 3).join(' · ');

  return (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => onPress(item._id)}
      activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: item.images?.[0] || 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel',
          }}
          style={styles.hotelImage}
        />
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onFavorite(item._id)}>
          <Text style={styles.heartIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hotelInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {getHotelName(item.name)}
          </Text>
          <View style={styles.rating}>
            <Text style={styles.starIcon}>★</Text>
            <Text style={styles.ratingText}>{item.rating || '4.8'}</Text>
          </View>
        </View>

        <View style={styles.hotelTags}>
          <Text style={styles.tag}>{'⭐'.repeat(item.starLevel || 4)}</Text>
        </View>

        {/* 附近景点、交通、商场 */}
        {nearbyInfo ? (
          <Text style={styles.nearbyInfo} numberOfLines={1}>
            📍 {nearbyInfo}
          </Text>
        ) : null}

        {/* 酒店地址 */}
        {item.address && (
          <Text style={styles.addressText} numberOfLines={1}>
            🏠 {item.address}
          </Text>
        )}

        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>¥</Text>
            <Text style={styles.price}>{minPrice}</Text>
            {hasMultipleRooms && <Text style={styles.priceUnit}>起</Text>}
            <Text style={styles.priceUnit}>/晚</Text>
          </View>
          {item.originalPrice && (
            <Text style={styles.originalPrice}>¥{item.originalPrice}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  hotelCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  hotelImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  favoriteBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 20,
    color: '#FF385C',
  },
  hotelInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  starIcon: {
    fontSize: 14,
    color: '#FFB400',
    marginRight: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  hotelTags: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tag: {
    fontSize: 12,
    color: '#666',
  },
  nearbyInfo: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceLabel: {
    fontSize: 14,
    color: '#FF385C',
    fontWeight: 'bold',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF385C',
    marginLeft: 2,
  },
  priceUnit: {
    fontSize: 14,
    color: '#FF385C',
    marginLeft: 2,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
  },
});

export default HotelCard;
