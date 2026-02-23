import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MapButtonProps {
  onPress: () => void;
}

const MapButton: React.FC<MapButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.iconCircle}>
        <Ionicons name="location-sharp" size={20} color="#fff" />
      </View>
      <Text style={styles.label}>地图</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  iconCircle: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 18,
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    color: '#111',
  },
});

export default MapButton;
