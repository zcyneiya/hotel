import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Button, DatePicker, Select, Space, Card, message, Upload, Row, Col, Modal } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { hotelService, poiService } from '../../services/api';
import imageCompression from 'browser-image-compression';
import { loadAmap } from '../../utils/amapLoader';

const { TextArea } = Input;

function HotelForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hotelImageList, setHotelImageList] = useState([]);

  const [mapOpen, setMapOpen] = useState(false);
  const [mapError, setMapError] = useState('');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState('');
  const selectedPointRef = useRef(null);
  const selectedAddressRef = useRef('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const geocoderRef = useRef(null);
  const amapRef = useRef(null);


  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      const res = await hotelService.getHotelById(id);
      const hotel = res.data;

      // 转换图片数据为 Upload 组件需要的格式
      const imageList = (hotel.images || []).map((url, index) => ({
        uid: `-${index}`,
        name: `image-${index}.jpg`,
        status: 'done',
        url: url
      }));
      setHotelImageList(imageList);

      form.setFieldsValue({
        ...hotel,
        openDate: dayjs(hotel.openDate)
      });
    } catch (error) {
      message.error('获取酒店信息失败');
    }
  };

  const applySelectedPoint = (point) => {
    selectedPointRef.current = point;
    setSelectedPoint(point);
    const AMap = amapRef.current || window.AMap;
    if (!mapInstanceRef.current || !AMap) return;
    if (!markerRef.current) {
      markerRef.current = new AMap.Marker({ position: [point.lng, point.lat] });
      mapInstanceRef.current.add(markerRef.current);
    } else {
      markerRef.current.setPosition([point.lng, point.lat]);
    }
  };

  const applySelectedAddress = (addr) => {
    const value = addr || '';
    selectedAddressRef.current = value;
    setSelectedAddress(value);
  };

  const ensureGeocoder = () => {
    if (geocoderRef.current) return Promise.resolve(true);
    const AMap = amapRef.current || window.AMap;
    if (!AMap) return Promise.resolve(false);
    if (AMap.Geocoder) {
      geocoderRef.current = new AMap.Geocoder();
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      AMap.plugin('AMap.Geocoder', () => {
        geocoderRef.current = new AMap.Geocoder();
        resolve(true);
      });
    });
  };

  const reverseGeocodeSafe = async (point) => {
    const ready = await ensureGeocoder();
    if (!ready) return '';
    return new Promise((resolve) => {
      geocoderRef.current.getAddress([point.lng, point.lat], (status, result) => {
        if (status === 'complete' && result?.regeocode?.formattedAddress) {
          resolve(result.regeocode.formattedAddress);
        } else {
          resolve('');
        }
      });
    });
  };

  const updateByCenter = async () => {
    if (!mapInstanceRef.current) return;
    const center = mapInstanceRef.current.getCenter();
    const point = { lng: center.lng, lat: center.lat };
    applySelectedPoint(point);
    applySelectedAddress('');
    const addr = await reverseGeocodeSafe(point);
    applySelectedAddress(addr);
  };

  const searchLocation = async () => {
    const keyword = (searchKeyword || '').trim();
    if (!keyword) {
      message.warning('请输入要定位的城市或地址');
      return;
    }
    const ready = await ensureGeocoder();
    if (!ready || !mapInstanceRef.current) {
      message.warning('地理编码未初始化，请稍后再试');
      return;
    }
    geocoderRef.current.getLocation(keyword, (status, result) => {
      if (status === 'complete' && result?.geocodes?.length) {
        const loc = result.geocodes[0].location;
        const point = { lng: loc.lng, lat: loc.lat };
        mapInstanceRef.current.setCenter([point.lng, point.lat]);
        applySelectedPoint(point);
        applySelectedAddress(result.geocodes[0].formattedAddress || '');
      } else {
        message.warning(result?.info || '未找到该位置');
      }
    });
  };

  const initMap = async () => {
    try {
      const key = import.meta.env.VITE_AMAP_JS_KEY;
      if (!key) {
        setMapError('未配置 VITE_AMAP_JS_KEY');
        return;
      }
      const securityCode = import.meta.env.VITE_AMAP_JS_SECURITY_CODE;
      const AMap = await loadAmap(key, securityCode);
      amapRef.current = AMap;

      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new AMap.Map(mapRef.current, {
          zoom: 14,
          center: [116.397428, 39.90923],
        });
        await ensureGeocoder();

        mapInstanceRef.current.on('click', (e) => {
          const lng = e.lnglat.getLng();
          const lat = e.lnglat.getLat();
          const point = { lng, lat };
          applySelectedPoint(point);
          applySelectedAddress('');
          reverseGeocodeSafe(point).then(applySelectedAddress);
        });

        mapInstanceRef.current.on('moveend', updateByCenter);
        mapInstanceRef.current.on('zoomend', updateByCenter);
      }

      const lng = Number(form.getFieldValue(['location', 'lng']));
      const lat = Number(form.getFieldValue(['location', 'lat']));
      if (Number.isFinite(lng) && Number.isFinite(lat)) {
        const point = { lng, lat };
        const addr = form.getFieldValue('address') || '';
        applySelectedPoint(point);
        applySelectedAddress(addr);
        const pos = [lng, lat];
        mapInstanceRef.current.setCenter(pos);
      } else {
        selectedPointRef.current = null;
        setSelectedPoint(null);
        selectedAddressRef.current = '';
        setSelectedAddress('');
        updateByCenter();
      }

      setTimeout(() => mapInstanceRef.current?.resize(), 0);
    } catch (e) {
      setMapError('地图加载失败，请检查网络或 Key');
    }
  };

  useEffect(() => {
    if (mapOpen) initMap();
  }, [mapOpen]);

  const hasNearby = () => {
    const a = form.getFieldValue(['nearby', 'attractions']) || [];
    const t = form.getFieldValue(['nearby', 'transportation']) || [];
    const s = form.getFieldValue(['nearby', 'shopping']) || [];
    return a.length || t.length || s.length;
  };

  const confirmOverwriteNearby = () =>
    new Promise((resolve) => {
      if (!hasNearby()) return resolve(true);
      Modal.confirm({
        title: '覆盖周边信息？',
        content: '已有周边信息将被自动推荐覆盖，是否继续？',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

  const uniqByName = (list) => {
    const seen = new Set();
    return list.filter((item) => {
      if (seen.has(item.name)) return false;
      seen.add(item.name);
      return true;
    });
  };

  const buildNearbyList = (pois, type) =>
    uniqByName(pois)
      .sort((a, b) => Number(a.distance) - Number(b.distance))
      .slice(0, 8)
      .map((p) => ({
        name: p.name,
        distance: String(p.distance),
        type
      }));

  const autoFillNearby = async (point) => {
    try {
      const [scenicRes, transportRes, mallRes] = await Promise.all([
        poiService.getAround({ location: `${point.lng},${point.lat}`, types: '110000' }),
        poiService.getAround({ location: `${point.lng},${point.lat}`, types: '150000' }),
        poiService.getAround({ location: `${point.lng},${point.lat}`, types: '060000' }),
      ]);

      form.setFieldsValue({
        nearby: {
          attractions: buildNearbyList(scenicRes?.data?.pois || [], 'scenic'),
          transportation: buildNearbyList(transportRes?.data?.pois || [], 'subway'),
          shopping: buildNearbyList(mallRes?.data?.pois || [], 'mall'),
        }
      });
    } catch (e) {
      message.warning('周边推荐失败，可手动填写');
    }
  };


  // 处理图片上传
  const handleImageChange = ({ fileList }) => {
    setHotelImageList(fileList);
  };

  // 自定义上传
  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      // 1. 配置压缩选项
      const options = {
        maxSizeMB: 1,          // 最大文件大小 1MB
        maxWidthOrHeight: 1920, // 最大宽或高
        useWebWorker: true,
      };

      // 2. 压缩图片
      const compressedFile = await imageCompression(file, options);

      // 3.构建 FormData
      const formData = new FormData();
      formData.append('file', compressedFile);

      // 4. 调用上传接口
      const response = await hotelService.uploadImage(formData);

      if (response && response.data) {
        onSuccess(response.data.url);
        message.success('图片上传成功');
      } else {
        onError(new Error('上传响应异常'));
      }
    } catch (error) {
      console.error('上传失败:', error);
      onError(error);
      message.error('图片上传失败');
    }
  };

  const onFinish = async (values) => {
    // 验证至少上传一张图片
    if (hotelImageList.length === 0) {
      message.error('请至少上传一张酒店图片');
      return;
    }

    setLoading(true);
    try {
      // 提取图片 URL
      const images = hotelImageList.map(file => {
        if (file.response) {
          return file.response; // 服务器返回的 URL
        }
        return file.url; // 已存在的 URL
      }).filter(Boolean);

      const data = {
        ...values,
        openDate: values.openDate.toISOString(),
        images: images
      };

      if (id) {
        await hotelService.updateHotel(id, data);
        message.success('更新成功');
      } else {
        await hotelService.createHotel(data);
        message.success('创建成功');
      }
      navigate('/merchant/hotels');
    } catch (error) {
      message.error(error.response?.data?.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={id ? '编辑酒店' : '新增酒店'}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          starLevel: 3,
          facilities: [],
          rooms: [{ type: '', price: 0, totalRooms: 1, availableRooms: 1, capacity: 2, facilities: [] }],
          promotions: [],
          nearby: {
            attractions: [],
            transportation: [],
            shopping: []
          }
        }}
      >
        <Card title="基本信息" style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="酒店名称（中文）"
                name={['name', 'cn']}
                rules={[{ required: true, message: '请输入酒店中文名称' }]}
              >
                <Input placeholder="请输入酒店中文名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="酒店名称（英文）"
                name={['name', 'en']}
                rules={[{ required: true, message: '请输入酒店英文名称' }]}
              >
                <Input placeholder="请输入酒店英文名称" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="城市"
                name="city"
                rules={[{ required: true, message: '请输入城市' }]}
              >
                <Input placeholder="请输入城市" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="星级"
                name="starLevel"
                rules={[{ required: true, message: '请选择星级' }]}
              >
                <Select>
                  <Select.Option value={1}>1星</Select.Option>
                  <Select.Option value={2}>2星</Select.Option>
                  <Select.Option value={3}>3星</Select.Option>
                  <Select.Option value={4}>4星</Select.Option>
                  <Select.Option value={5}>5星</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="地址" required>
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="address"
                rules={[{ required: true, message: '请输入地址' }]}
                noStyle
              >
                <Input placeholder="请输入详细地址" />
              </Form.Item>
              <Button onClick={() => { setMapError(''); setMapOpen(true); }}>
                地图选址
              </Button>
            </Space.Compact>
          </Form.Item>

          <Form.Item name={['location', 'lng']} hidden>
            <Input />
          </Form.Item>
          <Form.Item name={['location', 'lat']} hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="开业时间"
            name="openDate"
            rules={[{ required: true, message: '请选择开业时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="酒店图片"
            required
            extra="请至少上传一张酒店图片，支持 JPG、PNG 格式"
          >
            <Upload
              listType="picture-card"
              fileList={hotelImageList}
              onChange={handleImageChange}
              customRequest={customUpload}
              accept="image/*"
              multiple
            >
              {hotelImageList.length >= 8 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传图片</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="酒店设施"
            name="facilities"
          >
            <Select mode="tags" placeholder="输入设施名称后按回车添加">
              <Select.Option value="免费WiFi">免费WiFi</Select.Option>
              <Select.Option value="停车场">停车场</Select.Option>
              <Select.Option value="游泳池">游泳池</Select.Option>
              <Select.Option value="健身房">健身房</Select.Option>
              <Select.Option value="餐厅">餐厅</Select.Option>
            </Select>
          </Form.Item>
        </Card>

        <Card title="房型信息" style={{ marginBottom: 16 }}>
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="房型名称"
                          name={[name, 'type']}
                          rules={[{ required: true, message: '请输入房型' }]}
                        >
                          <Input placeholder="如：豪华大床房" />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="价格（元/晚）"
                          name={[name, 'price']}
                          rules={[{ required: true, message: '请输入价格' }]}
                        >
                          <InputNumber placeholder="价格" min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="可容纳人数"
                          name={[name, 'capacity']}
                          rules={[{ required: true, message: '请输入可容纳人数' }]}
                        >
                          <InputNumber placeholder="人数" min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="房间总数"
                          name={[name, 'totalRooms']}
                          rules={[{ required: true, message: '请输入房间总数' }]}
                        >
                          <InputNumber placeholder="总数" min={1} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="空闲房间数"
                          name={[name, 'availableRooms']}
                          rules={[{ required: true, message: '请输入空闲房间数' }]}
                        >
                          <InputNumber placeholder="空闲数" min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="房间设施"
                          name={[name, 'facilities']}
                        >
                          <Select mode="tags" placeholder="房间设施">
                            <Select.Option value="独立卫浴">独立卫浴</Select.Option>
                            <Select.Option value="空调">空调</Select.Option>
                            <Select.Option value="电视">电视</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button type="link" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                      删除此房型
                    </Button>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加房型
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Card title="周边信息" style={{ marginBottom: 16 }}>
          <Card type="inner" title="热门景点" size="small" style={{ marginBottom: 16 }}>
            <Form.List name={['nearby', 'attractions']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入景点名称' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="景点名称" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'distance']}
                        rules={[{ required: true, message: '请输入距离' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="如：500米" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: '请选择类型' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Select placeholder="类型" style={{ width: 120 }}>
                          <Select.Option value="scenic">景区</Select.Option>
                          <Select.Option value="museum">博物馆</Select.Option>
                          <Select.Option value="park">公园</Select.Option>
                          <Select.Option value="landmark">地标</Select.Option>
                          <Select.Option value="other">其他</Select.Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加景点
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Card type="inner" title="交通设施" size="small" style={{ marginBottom: 16 }}>
            <Form.List name={['nearby', 'transportation']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入名称' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="如：地铁1号线" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'distance']}
                        rules={[{ required: true, message: '请输入距离' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="如：300米" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: '请选择类型' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Select placeholder="类型" style={{ width: 120 }}>
                          <Select.Option value="subway">地铁</Select.Option>
                          <Select.Option value="bus">公交</Select.Option>
                          <Select.Option value="train">火车站</Select.Option>
                          <Select.Option value="airport">机场</Select.Option>
                          <Select.Option value="other">其他</Select.Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加交通设施
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>

          <Card type="inner" title="商场购物" size="small">
            <Form.List name={['nearby', 'shopping']}>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} style={{ display: 'flex', marginBottom: 8, alignItems: 'center' }}>
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: '请输入名称' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="商场名称" style={{ width: 200 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'distance']}
                        rules={[{ required: true, message: '请输入距离' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Input placeholder="如：1公里" style={{ width: 120 }} />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'type']}
                        rules={[{ required: true, message: '请选择类型' }]}
                        style={{ marginBottom: 0, marginRight: 8 }}
                      >
                        <Select placeholder="类型" style={{ width: 120 }}>
                          <Select.Option value="mall">购物中心</Select.Option>
                          <Select.Option value="supermarket">超市</Select.Option>
                          <Select.Option value="market">市场</Select.Option>
                          <Select.Option value="other">其他</Select.Option>
                        </Select>
                      </Form.Item>
                      <MinusCircleOutlined onClick={() => remove(name)} />
                    </div>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      添加商场
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </Card>

        <Card title="优惠活动" style={{ marginBottom: 16 }}>
          <Form.List name="promotions">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Card key={key} size="small" style={{ marginBottom: 16 }}>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="活动标题"
                          name={[name, 'title']}
                          rules={[{ required: true, message: '请输入活动标题' }]}
                        >
                          <Input placeholder="如：早鸟优惠" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          label="优惠场景"
                          name={[name, 'scenario']}
                          rules={[{ required: true, message: '请选择优惠场景' }]}
                        >
                          <Select placeholder="选择场景">
                            <Select.Option value="earlybird">早鸟优惠</Select.Option>
                            <Select.Option value="lastminute">尾房特惠</Select.Option>
                            <Select.Option value="longstay">连住优惠</Select.Option>
                            <Select.Option value="weekend">周末特惠</Select.Option>
                            <Select.Option value="holiday">节假日优惠</Select.Option>
                            <Select.Option value="member">会员专享</Select.Option>
                            <Select.Option value="other">其他</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row gutter={16}>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="折扣类型"
                          name={[name, 'discountType']}
                          rules={[{ required: true, message: '请选择折扣类型' }]}
                        >
                          <Select placeholder="类型">
                            <Select.Option value="percentage">百分比折扣</Select.Option>
                            <Select.Option value="fixed">固定金额减免</Select.Option>
                            <Select.Option value="special">特价</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          label="折扣值"
                          name={[name, 'discount']}
                          rules={[{ required: true, message: '请输入折扣值' }]}
                        >
                          <InputNumber placeholder="如：8.5 或 50" min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item
                      {...restField}
                      label="活动描述"
                      name={[name, 'description']}
                    >
                      <TextArea placeholder="活动详细说明" rows={2} />
                    </Form.Item>
                    <Button type="link" danger onClick={() => remove(name)} icon={<MinusCircleOutlined />}>
                      删除此活动
                    </Button>
                  </Card>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加优惠活动
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Card>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存
            </Button>
            <Button onClick={() => navigate('/merchant/hotels')}>
              取消
            </Button>
          </Space>
        </Form.Item>
      </Form>

      <Modal
        title="地图选址"
        open={mapOpen}
        destroyOnHidden={false}
        onCancel={() => setMapOpen(false)}
        onOk={async () => {
          const point = selectedPointRef.current || selectedPoint;
          if (!point) {
            message.warning('请先在地图上选择位置');
            return;
          }

          let addr = selectedAddressRef.current || selectedAddress;
          if (!addr) {
            addr = await reverseGeocodeSafe(point);
          }
          if (!addr) {
            addr = form.getFieldValue('address') || '';
          }
          if (!addr) {
            addr = `${point.lng.toFixed(6)},${point.lat.toFixed(6)}`;
            message.warning('地址解析失败，已使用坐标回填');
          }

          form.setFieldsValue({
            address: addr || form.getFieldValue('address'),
            location: point
          });

          const ok = await confirmOverwriteNearby();
          if (ok) {
            await autoFillNearby(point);
          } else {
            message.info('已保留原周边信息');
          }

          setMapOpen(false);
        }}
        width={800}
        afterOpenChange={(open) => {
          if (open) setTimeout(() => mapInstanceRef.current?.resize(), 0);
        }}
      >
        <Space style={{ marginBottom: 8 }}>
          <Input
            placeholder="输入城市/地址，例如：重庆"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onPressEnter={searchLocation}
          />
          <Button onClick={searchLocation}>定位</Button>
        </Space>
        <div style={{ marginBottom: 8, color: '#555' }}>
          当前选中：
          {selectedAddress
            ? ` ${selectedAddress}`
            : (selectedPoint
              ? ` ${selectedPoint.lng.toFixed(6)}, ${selectedPoint.lat.toFixed(6)}`
              : ' 请点击或拖拽地图选择位置')}
        </div>
        {mapError ? (
          <div style={{ color: 'red' }}>{mapError}</div>
        ) : (
          <div ref={mapRef} style={{ width: '100%', height: 400 }} />
        )}
      </Modal>
    </Card>
  );
}

export default HotelForm;
