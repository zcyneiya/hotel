import { Platform } from 'react-native';

// 真机调试时改成你电脑的局域网 IP
const LAN_IP = '10.81.55.94';

// iOS 模拟器 → localhost，Android 模拟器 → 10.0.2.2，真机 → 局域网 IP
// 切换方式：模拟器时保持默认，真机调试时将 IS_SIMULATOR 改为 false
const IS_SIMULATOR = false;

const getBaseUrl = () => {
  if (!IS_SIMULATOR) return `http://${LAN_IP}:3000`;
  if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();
export const API_URL = `${BASE_URL}/api`;
export const AMAP_JS_KEY = process.env.EXPO_PUBLIC_AMAP_JS_KEY || '';
export const AMAP_JS_SECURITY_CODE =
  process.env.EXPO_PUBLIC_AMAP_JS_SECURITY_CODE || '';
