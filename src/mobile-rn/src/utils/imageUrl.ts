import { BASE_URL } from '../config';

export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel';
  
  // 如果 url 是 null、undefined 或非字符串，返回一个占位图
  if (typeof url !== 'string') return 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel';

  if (url.startsWith('http')) {
    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost:\d+/, BASE_URL);
    }
    return url;
  }
  
  // 如果是相对路径
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  
  return `${BASE_URL}/${url}`;
};
