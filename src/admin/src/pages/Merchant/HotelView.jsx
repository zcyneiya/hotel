import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Space, Button, Image, message, Spin, Divider } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { hotelService } from '../../services/api';

const statusMap = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'processing' },
  published: { text: '已发布', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  offline: { text: '已下线', color: 'default' }
};

function HotelView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotelDetail();
  }, [id]);

  const fetchHotelDetail = async () => {
    setLoading(true);
    try {
      const res = await hotelService.getHotelById(id);
      setHotel(res.data);
    } catch (error) {
      message.error('获取酒店详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <p>酒店不存在</p>
        <Button onClick={() => navigate('/merchant/hotels')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/merchant/hotels')}
        >
          返回列表
        </Button>
      </div>

      <Card title="基本信息">
        <Descriptions bordered column={2}>
          <Descriptions.Item label="酒店名称（中文）">
            {hotel.name?.cn}
          </Descriptions.Item>
          <Descriptions.Item label="酒店名称（英文）">
            {hotel.name?.en}
          </Descriptions.Item>
          <Descriptions.Item label="城市">
            {hotel.city}
          </Descriptions.Item>
          <Descriptions.Item label="星级">
            {hotel.starLevel}星
          </Descriptions.Item>
          <Descriptions.Item label="地址" span={2}>
            {hotel.address}
          </Descriptions.Item>
          <Descriptions.Item label="开业日期">
            {hotel.openDate ? new Date(hotel.openDate).toLocaleDateString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={statusMap[hotel.status]?.color}>
              {statusMap[hotel.status]?.text}
            </Tag>
          </Descriptions.Item>
          {hotel.rejectReason && (
            <Descriptions.Item label="驳回原因" span={2}>
              <span style={{ color: 'red' }}>{hotel.rejectReason}</span>
            </Descriptions.Item>
          )}
          {hotel.offlineReason && (
            <Descriptions.Item label="下线原因" span={2}>
              <span style={{ color: 'red' }}>{hotel.offlineReason}</span>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <Card title="酒店图片" style={{ marginTop: 16 }}>
        {hotel.images && hotel.images.length > 0 ? (
          <Image.PreviewGroup>
            <Space wrap>
              {hotel.images.map((img, index) => (
                <Image
                  key={index}
                  width={200}
                  src={img}
                  alt={`酒店图片${index + 1}`}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          <p>暂无图片</p>
        )}
      </Card>

      <Card title="设施服务" style={{ marginTop: 16 }}>
        {hotel.facilities && hotel.facilities.length > 0 ? (
          <Space wrap>
            {hotel.facilities.map((facility, index) => (
              <Tag key={index} color="blue">{facility}</Tag>
            ))}
          </Space>
        ) : (
          <p>暂无设施信息</p>
        )}
      </Card>

      <Card title="附近信息" style={{ marginTop: 16 }}>
        {hotel.nearby ? (
          <>
            {hotel.nearby.attractions && hotel.nearby.attractions.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>🎯 附近景点</h4>
                <Space direction="vertical">
                  {hotel.nearby.attractions.map((item, index) => (
                    <div key={index}>
                      <Tag color="green">{item.name}</Tag>
                      <span style={{ marginLeft: 8, color: '#666' }}>
                        {item.distance}
                      </span>
                    </div>
                  ))}
                </Space>
              </div>
            )}
            {hotel.nearby.transportation && hotel.nearby.transportation.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <h4>🚇 附近交通</h4>
                <Space direction="vertical">
                  {hotel.nearby.transportation.map((item, index) => (
                    <div key={index}>
                      <Tag color="blue">{item.name}</Tag>
                      <span style={{ marginLeft: 8, color: '#666' }}>
                        {item.distance}
                      </span>
                    </div>
                  ))}
                </Space>
              </div>
            )}
            {hotel.nearby.shopping && hotel.nearby.shopping.length > 0 && (
              <div>
                <h4>🛍️ 附近商场</h4>
                <Space direction="vertical">
                  {hotel.nearby.shopping.map((item, index) => (
                    <div key={index}>
                      <Tag color="orange">{item.name}</Tag>
                      <span style={{ marginLeft: 8, color: '#666' }}>
                        {item.distance}
                      </span>
                    </div>
                  ))}
                </Space>
              </div>
            )}
          </>
        ) : (
          <p>暂无附近信息</p>
        )}
      </Card>

      <Card title="房型信息" style={{ marginTop: 16 }}>
        {hotel.rooms && hotel.rooms.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {hotel.rooms.map((room, index) => (
              <Card
                key={index}
                type="inner"
                title={room.type}
                extra={<Tag color="red">¥{room.price}/晚</Tag>}
              >
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="价格">
                    ¥{room.price}
                  </Descriptions.Item>
                  <Descriptions.Item label="容纳人数">
                    {room.capacity}人
                  </Descriptions.Item>
                  <Descriptions.Item label="总房间数">
                    {room.totalRooms}间
                  </Descriptions.Item>
                  <Descriptions.Item label="可用房间数">
                    {room.availableRooms}间
                  </Descriptions.Item>
                  {room.facilities && room.facilities.length > 0 && (
                    <Descriptions.Item label="房间设施" span={2}>
                      <Space wrap>
                        {room.facilities.map((facility, idx) => (
                          <Tag key={idx}>{facility}</Tag>
                        ))}
                      </Space>
                    </Descriptions.Item>
                  )}
                  {room.description && (
                    <Descriptions.Item label="房间描述" span={2}>
                      {room.description}
                    </Descriptions.Item>
                  )}
                </Descriptions>
                {room.images && room.images.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <Divider orientation="left">房间图片</Divider>
                    <Image.PreviewGroup>
                      <Space wrap>
                        {room.images.map((img, imgIdx) => (
                          <Image
                            key={imgIdx}
                            width={150}
                            src={img}
                            alt={`房间图片${imgIdx + 1}`}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                )}
              </Card>
            ))}
          </Space>
        ) : (
          <p>暂无房型信息</p>
        )}
      </Card>

      <Card title="促销活动" style={{ marginTop: 16 }}>
        {hotel.promotions && hotel.promotions.length > 0 ? (
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {hotel.promotions.map((promo, index) => (
              <Card key={index} type="inner" title={promo.title}>
                <Descriptions bordered column={2} size="small">
                  <Descriptions.Item label="描述" span={2}>
                    {promo.description}
                  </Descriptions.Item>
                  <Descriptions.Item label="折扣">
                    {promo.discountType === 'percentage' && `${promo.discount}%`}
                    {promo.discountType === 'fixed' && `¥${promo.discount}`}
                    {promo.discountType === 'special' && '特价'}
                  </Descriptions.Item>
                  <Descriptions.Item label="场景">
                    {promo.scenario}
                  </Descriptions.Item>
                  <Descriptions.Item label="开始日期">
                    {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="结束日期">
                    {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '-'}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            ))}
          </Space>
        ) : (
          <p>暂无促销活动</p>
        )}
      </Card>
    </div>
  );
}

export default HotelView;
