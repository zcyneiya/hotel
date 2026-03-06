import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

type Props = {
  onPress: () => void;
};

const ChatButton = ({ onPress }: Props) => (
  <TouchableOpacity style={styles.btn} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.icon}>💬</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    right: 16,
    bottom: 130,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF385C',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF385C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  icon: {
    fontSize: 22,
  },
});

export default ChatButton;
