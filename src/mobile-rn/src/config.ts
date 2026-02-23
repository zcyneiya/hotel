// Replace with your local machine's IP address
// For Android Emulator, use '10.0.2.2'
// For iOS Simulator, use 'localhost'
// For Physical Device, use your computer's LAN IP (e.g., 192.168.1.x)
export const BASE_URL = 'http://192.168.123.16:3000';
export const API_URL = `${BASE_URL}/api`;
export const AMAP_JS_KEY = process.env.EXPO_PUBLIC_AMAP_JS_KEY || '';
export const AMAP_JS_SECURITY_CODE =
  process.env.EXPO_PUBLIC_AMAP_JS_SECURITY_CODE || '';
