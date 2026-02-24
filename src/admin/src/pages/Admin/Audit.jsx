import React, { useEffect, useState } from 'react';
import { Table, Button, Descriptions, Divider, Drawer, Tag, Space, Spin, message, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { auditService } from '../../services/api';

const { TextArea } = Input;

function AdminAudit() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await auditService.getPendingHotels();
      setHotels(res.data);
    } catch (error) {
      message.error('获取待审核列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleApprove = async (id) => {
    Modal.confirm({
      title: '确认通过审核？',
      content: '通过后酒店将在用户端展示',
      onOk: async () => {
        try {
          await auditService.approveHotel(id);
          message.success('审核通过');
          fetchHotels();
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
  };

  const handleReject = (hotel) => {
    setCurrentHotel(hotel);
    setRejectModalVisible(true);
  };

  const confirmReject = async () => {
    if (!rejectReason.trim()) {
      message.error('请填写驳回原因');
      return;
    }

    try {
      await auditService.rejectHotel(currentHotel._id, rejectReason);
      message.success('已驳回');
      setRejectModalVisible(false);
      setRejectReason('');
      setCurrentHotel(null);
      fetchHotels();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: ['name', 'cn'],
      key: 'name'
    },
    {
      title: '城市',
      dataIndex: 'city',
      key: 'city'
    },
    {
      title: '星级',
      dataIndex: 'starLevel',
      key: 'starLevel',
      render: (level) => `${level}星`
    },
    {
      title: '商户',
      dataIndex: ['merchantId', 'username'],
      key: 'merchant'
    },
    {
      title: '房型数量',
      dataIndex: 'rooms',
      key: 'rooms',
      render: (rooms) => rooms?.length || 0
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="processing">待审核</Tag>
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleApprove(record._id);
            }}
          >
            通过
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleReject(record);
            }}
          >
            驳回
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <h2>待审核酒店</h2>
      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
        onRow={(record) => ({
          onClick: () => {
            setCurrentHotel(record);
            setOpenDrawer(true);
          },
          style: { cursor: 'pointer' }
        })}
      />

      <Modal
        title="驳回审核"
        open={rejectModalVisible}
        onOk={confirmReject}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
          setCurrentHotel(null);
        }}
      >
        <p>酒店名称：{currentHotel?.name?.cn}</p>
        <TextArea
          rows={4}
          placeholder="请填写驳回原因"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
      <HotelAuditDrawer
        setOpenDrawer={setOpenDrawer}
        setCurrentHotel={setCurrentHotel}
        openDrawer={openDrawer}
        currentHotel={currentHotel}
        onApprove={handleApprove}
        onReject={handleReject}
      />

    </div>
  );
}

const HotelAuditDrawer = ({
  setOpenDrawer,
  setCurrentHotel,
  openDrawer,
  currentHotel,
  onApprove,
  onReject
}) => {
  return (
    <Drawer
      title="酒店审核详情"
      width={720}
      onClose={() => {
        setOpenDrawer(false);
        setCurrentHotel(null);
      }}
      open={openDrawer}
      style={{ body: { paddingBottom: 80 } }}
    >
      {!currentHotel ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin />
        </div>
      ) : (
        <>
          <Divider orientation="left">基础信息</Divider>
          <Descriptions
            bordered
            column={1}
            size="small"
            style={{ marginBottom: 16 }}
          >
            <Descriptions.Item label="酒店名称">
              {currentHotel?.name?.cn}
            </Descriptions.Item>

            <Descriptions.Item label="城市">
              {currentHotel.city}
            </Descriptions.Item>

            <Descriptions.Item label="星级">
              {currentHotel.starLevel} 星
            </Descriptions.Item>

            <Descriptions.Item label="商户">
              {currentHotel?.merchantId?.username}
            </Descriptions.Item>

            <Descriptions.Item label="房型数量">
              {currentHotel.rooms?.length || 0}
            </Descriptions.Item>

            <Descriptions.Item label="状态">
              <Tag color="processing">待审核</Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">房型信息</Divider>

          {currentHotel.rooms && currentHotel.rooms.length > 0 ? (
            currentHotel.rooms.map((room) => (
              <Descriptions
                key={room._id}
                bordered
                column={1}
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="房型">
                  {room.type}
                </Descriptions.Item>

                <Descriptions.Item label="价格">
                  ¥{room.price}/晚
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
              </Descriptions>
            ))
          ) : (
            <p>暂无房型信息</p>
          )}

          <Divider orientation="left">促销活动</Divider>

          {currentHotel.promotions && currentHotel.promotions.length > 0 ? (
            currentHotel.promotions.map((promo) => (
              <Descriptions
                key={promo._id}
                bordered
                column={1}
                size="small"
                style={{ marginBottom: 16 }}
              >
                <Descriptions.Item label="标题">
                  {promo.title}
                </Descriptions.Item>

                <Descriptions.Item label="折扣">
                  {promo.discountType === 'percentage' && `${promo.discount}%`}
                  {promo.discountType === 'fixed' && `¥${promo.discount}`}
                  {promo.discountType === 'special' && '特价'}
                </Descriptions.Item>

                <Descriptions.Item label="开始日期">
                  {promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="结束日期">
                  {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '-'}
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <p>暂无促销活动</p>
          )}

          <Divider />


          <Space>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                onApprove(currentHotel._id);
                setOpenDrawer(false);
              }}
            >
              审核通过
            </Button>

            <Button
              danger
              icon={<CloseOutlined />}
              onClick={() => {
                setOpenDrawer(false);
                onReject(currentHotel);
              }}
            >
              驳回
            </Button>
          </Space>
        </>
      )}
    </Drawer>
  )
}

export default AdminAudit;
