import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

if (__DEV__ && Platform.OS !== 'web') {
  require('./src/ReactotronConfig');
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
