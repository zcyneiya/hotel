import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ImageSourcePropType,
} from 'react-native';

const { width } = Dimensions.get('window');

export type DestinationItem = {
  id: number;
  name: string;
  image: ImageSourcePropType;
  desc: string;
};

interface HomeDestinationsProps {
  destinations: DestinationItem[];
  onPressCity: (city: string) => void;
}

const HomeDestinations: React.FC<HomeDestinationsProps> = ({
  destinations,
  onPressCity,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>热门目的地</Text>
      <View style={styles.destinationList}>
        {destinations.map(dest => (
          <TouchableOpacity
            key={dest.id}
            style={styles.destinationCard}
            onPress={() => onPressCity(dest.name)}
            activeOpacity={0.8}>
            <Image source={dest.image} style={styles.destImage} />
            <View style={styles.destOverlay}>
              <Text style={styles.destName}>{dest.name}</Text>
              <Text style={styles.destDesc}>{dest.desc}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default HomeDestinations;
