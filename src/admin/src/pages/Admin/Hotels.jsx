import React, { useEffect, useState } from 'react';
import { Descriptions, Divider, Drawer, Table, Tag, Select, Space, Spin, Button, Modal, message, Input } from 'antd';
import { CheckOutlined, CloseOutlined, DeleteOutlined } from '@ant-design/icons';
import { auditService } from '../../services/api';

const statusMap = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'processing' },
  published: { text: '已发布', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  offline: { text: '已下线', color: 'default' }
};

function AdminHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await auditService.getAllHotels({ status: statusFilter });
      setHotels(res.data);
    } catch (error) {
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [statusFilter]);

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

  const handleOffline = async (id) => {
    Modal.confirm({
      title: '确认下线？',
      content: '下线后用户端将不再展示该酒店',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const reason = await new Promise((resolve) => {
          Modal.confirm({
            title: '请输入下线原因',
            content: (
              <Input.TextArea
                id="offlineReason"
                placeholder="请输入下线原因"
                rows={4}
              />
            ),
            onOk: () => {
              const reasonInput = document.getElementById('offlineReason');
              resolve(reasonInput?.value || '管理员下线');
            },
            onCancel: () => resolve(null)
          });
        });

        if (reason === null) return;

        try {
          await auditService.offlineHotel(id, { reason });
          message.success('已下线');
          fetchHotels();
        } catch (error) {
          message.error('操作失败');
        }
      }
    });
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={statusMap[status]?.color}>
          {statusMap[status]?.text}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
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
            </>
          )}
          {record.status === 'published' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                handleOffline(record._id);
              }}
            >
              下线
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <span>状态筛选：</span>
        <Select
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
          allowClear
          placeholder="全部状态"
        >
          <Select.Option value="">全部</Select.Option>
          <Select.Option value="draft">草稿</Select.Option>
          <Select.Option value="pending">待审核</Select.Option>
          <Select.Option value="published">已发布</Select.Option>
          <Select.Option value="rejected">已驳回</Select.Option>
          <Select.Option value="offline">已下线</Select.Option>
        </Select>
      </Space>
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

      <HotelAuditDrawer
        mode={currentHotel?.status === 'pending' ? 'audit' : 'view'}
        openDrawer={openDrawer}
        currentHotel={currentHotel}
        setCurrentHotel={setCurrentHotel}
        setOpenDrawer={setOpenDrawer}
        onApprove={handleApprove}
        onReject={handleReject}
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
        <Input.TextArea
          rows={4}
          placeholder="请填写驳回原因"
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
      </Modal>
    </div>
  );
}

const HotelAuditDrawer = ({
  mode,
  setOpenDrawer,
  setCurrentHotel,
  openDrawer,
  currentHotel,
  onApprove,
  onReject
}) => {
  return (
    <Drawer
      title={mode === 'view' ? '酒店详情' : '酒店审核'}
      width={720}
      onClose={() => {
        setOpenDrawer(false);
        setCurrentHotel(null);
      }}
      open={openDrawer}
      styles={{
        body: {
          paddingBottom: mode === 'audit' ? 80 : 24,
          overflowY: 'auto'
        }
      }}
    >
      {!currentHotel ? (
        <div style={{ textAlign: 'center', padding: 50 }}>
          <Spin />
        </div>
      ) : (
        <>
          <Divider orientation="left">基础信息</Divider>

          <Descriptions bordered column={1} size="small" style={{ marginBottom: 16 }}>
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
              <Tag color={statusMap[currentHotel.status]?.color}>
                {statusMap[currentHotel.status]?.text}
              </Tag>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">酒店图片</Divider>

          {currentHotel.images?.length > 0 ? (
            <section style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {currentHotel.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`酒店图片${index + 1}`}
                  style={{
                    width: 120,
                    height: 90,
                    objectFit: 'cover',
                    borderRadius: 4
                  }}
                />
              ))}
            </section>
          ) : (
            <p>暂无酒店图片</p>
          )}

          <Divider orientation="left">房型信息</Divider>

          {currentHotel.rooms?.length > 0 ? (
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

          {currentHotel.promotions?.length > 0 ? (
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
                  {promo.startDate
                    ? new Date(promo.startDate).toLocaleDateString()
                    : '-'}
                </Descriptions.Item>

                <Descriptions.Item label="结束日期">
                  {promo.endDate
                    ? new Date(promo.endDate).toLocaleDateString()
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            ))
          ) : (
            <p>暂无促销活动</p>
          )}

          {mode === 'audit' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: '100%',
                borderTop: '1px solid #f0f0f0',
                padding: '16px 24px',
                background: '#fff',
                textAlign: 'right'
              }}
            >
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
            </div>
          )}
        </>
      )}
    </Drawer>
  );
};

export default AdminHotels;
