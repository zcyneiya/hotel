import Taro from '@tarojs/taro';

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

const request = (url, options = {}) => {
  return Taro.request({
    url: BASE_URL + url,
    method: options.method || 'GET',
    data: options.data,
    header: {
      'Content-Type': 'application/json',
      ...options.header
    }
  }).then(res => {
    if (res.statusCode === 200) {
      return res.data;
    }
    throw new Error(res.data.message || '请求失败');
  });
};

export default request;
