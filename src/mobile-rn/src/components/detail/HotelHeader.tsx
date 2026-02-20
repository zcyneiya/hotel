import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { getImageUrl } from '../../utils/imageUrl';

const { width } = Dimensions.get('window');
const AUTO_SCROLL_INTERVAL = 3000;

interface HotelHeaderProps {
  images: string[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBack: () => void;
}

export const HotelHeader: React.FC<HotelHeaderProps> = ({
  images,
  isFavorite,
  onToggleFavorite,
  onBack,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const displayImages = images.length > 0 ? images : [null];

  useEffect(() => {
    if (displayImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % displayImages.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(timer);
  }, [displayImages.length]);

  return (
    <View style={styles.imageSection}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentImageIndex(index);
        }}
        scrollEventThrottle={16}>
        {displayImages.map((img, index) => (
          <Image
            key={index}
            source={{ uri: getImageUrl(img) }}
            style={styles.hotelImage}
          />
        ))}
      </ScrollView>

      {/* 图片指示器 */}
      <View style={styles.imageIndicator}>
        {displayImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicatorDot,
              index === currentImageIndex && styles.indicatorDotActive,
            ]}
          />
        ))}
      </View>

      {/* 返回和收藏按钮 */}
      <View style={styles.topActions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onBack}>
          <Text style={styles.actionIcon}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onToggleFavorite}>
          <Text style={styles.actionIcon}>{isFavorite ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageSection: {
    position: 'relative',
    height: 300,
  },
  hotelImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorDotActive: {
    backgroundColor: '#fff',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topActions: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 20,
    color: '#333',
  },
});
