import { BASE_URL } from '../config';

export const getImageUrl = (url: string | undefined | null): string => {
  if (!url) return 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel';
  
  // If it's not a string, return placeholder
  if (typeof url !== 'string') return 'https://via.placeholder.com/690x460/667eea/ffffff?text=Hotel';

  // If it is already a full URL
  if (url.startsWith('http')) {
    // If it's localhost, replace with BASE_URL to work on devices/emulators
    if (url.includes('localhost')) {
      return url.replace(/http:\/\/localhost:\d+/, BASE_URL);
    }
    return url;
  }
  
  // If it's a relative path starting with /, remove the slash to avoid double slashes if BASE_URL ends with /
  // But BASE_URL is defined without trailing slash. So:
  if (url.startsWith('/')) {
    return `${BASE_URL}${url}`;
  }
  
  return `${BASE_URL}/${url}`;
};
