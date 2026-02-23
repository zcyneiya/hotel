import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { Platform } from 'react-native';

if (__DEV__ && Platform.OS !== 'web') {
  require('./src/ReactotronConfig');
}

export default function App() {
  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}
