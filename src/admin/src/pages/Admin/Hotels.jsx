import React, { useEffect, useState } from 'react';
import { Table, Tag, Select, Space, Button, Modal, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
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

  const handleOffline = async (id) => {
    Modal.confirm({
      title: '确认下线？',
      content: '下线后用户端将不再展示该酒店',
      onOk: async () => {
        try {
          await auditService.offlineHotel(id);
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
          {record.status === 'published' && (
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleOffline(record._id)}
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
      />
    </div>
  );
}

export default AdminHotels;
