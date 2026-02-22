export const loadAmap = (key, securityJsCode) => {
  /** @type {any} */
  const w = window;

  if (w.AMap) return Promise.resolve(w.AMap);
  if (w.__amapLoading) return w.__amapLoading;

  if (securityJsCode) {
    w._AMapSecurityConfig = {
      securityJsCode
    };
  }

  w.__amapLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geocoder`;
    script.async = true;
    script.onload = () => resolve(w.AMap);
    script.onerror = () => reject(new Error('AMap load error'));
    document.head.appendChild(script);
  });

  return w.__amapLoading;
};
