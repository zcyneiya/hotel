import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

type BannerItem = {
  id: number;
  title: string;
  image: string;
  hotelId: string;
};

interface HomeBannerProps {
  banners: BannerItem[];
  displayBanners: BannerItem[];
  currentBannerIndex: number;
  bannerScrollRef: React.RefObject<ScrollView | null>;
  onBannerPress: (hotelId: string) => void;
  onMomentumScrollEnd: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

const HomeBanner: React.FC<HomeBannerProps> = ({
  banners,
  displayBanners,
  currentBannerIndex,
  bannerScrollRef,
  onBannerPress,
  onMomentumScrollEnd,
}) => {
  return (
    <View style={styles.bannerSection}>
      <ScrollView
        ref={bannerScrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.bannerScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}>
        {displayBanners.map((banner, index) => (
          <TouchableOpacity
            key={`${banner.id}-${index}`}
            onPress={() => onBannerPress(banner.hotelId)}
            activeOpacity={0.9}>
            <Image source={{ uri: banner.image }} style={styles.bannerImage} />
            <View style={styles.bannerOverlay}>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {banners.length > 1 && (
        <View style={styles.bannerDotsContainer}>
          {banners.map((banner, index) => (
            <View
              key={`dot-${banner.id}`}
              style={[
                styles.bannerDot,
                index === (currentBannerIndex % banners.length) && styles.bannerDotActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bannerSection: {
    height: 200,
    backgroundColor: '#fff',
  },
  bannerScroll: {
    height: 200,
  },
  bannerImage: {
    width,
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
});

export default HomeBanner;
