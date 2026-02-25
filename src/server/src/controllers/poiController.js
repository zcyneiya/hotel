const fetchJson = async (url) => {
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Amap request failed: ${resp.status}`);
  }
  return resp.json();
};

export const geocode = async (req, res) => {
  const AMAP_KEY = process.env.AMAP_KEY;
  if (!AMAP_KEY) {
    return res.status(500).json({ success: false, message: 'AMAP_KEY is not configured' });
  }

  try {
    const { address, city } = req.query;
    if (!address) {
      return res.status(400).json({ success: false, message: 'address is required' });
    }

    const params = new URLSearchParams({
      key: AMAP_KEY || '',
      address: String(address),
    });

    console.log('Geocode params:', params.toString());

    if (city) params.append('city', String(city));

    const url = `https://restapi.amap.com/v3/geocode/geo?${params.toString()}`;
    const data = await fetchJson(url);

    if (data.status !== '1' || !data.geocodes?.length) {
      return res.status(404).json({ success: false, message: 'geocode not found', data });
    }

    const { location, formatted_address } = data.geocodes[0];
    res.json({
      success: true,
      data: { location, formatted_address }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const around = async (req, res) => {
  const AMAP_KEY = process.env.AMAP_KEY;
  if (!AMAP_KEY) {
    return res.status(500).json({ success: false, message: 'AMAP_KEY is not configured' });
  }

  try {
    const { location, types, radius = 2000 } = req.query;
    if (!location) {
      return res.status(400).json({ success: false, message: 'location is required' });
    }

    const params = new URLSearchParams({
      key: AMAP_KEY || '',
      location: String(location), // "lng,lat"
      radius: String(radius),
      extensions: 'base',
    });

    if (types) params.append('types', String(types));

    const url = `https://restapi.amap.com/v3/place/around?${params.toString()}`;
    const data = await fetchJson(url);

    if (data.status !== '1') {
      return res.status(500).json({ success: false, message: 'amap error', data });
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
