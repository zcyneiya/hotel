import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Modal, message } from 'antd';
import { RollbackOutlined } from '@ant-design/icons';
import { auditService } from '../../services/api';
import dayjs from 'dayjs';

function OfflineHotels() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOfflineHotels = async () => {
    setLoading(true);
    try {
      const res = await auditService.getOfflineHotels();
      setHotels(res.data);
    } catch (error) {
      message.error('获取下线酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfflineHotels();
  }, []);

  const handleRestore = async (id) => {
    Modal.confirm({
      title: '确认恢复上线？',
      content: '恢复后该酒店将重新在用户端展示',
      onOk: async () => {
        try {
          await auditService.restoreHotel(id);
          message.success('已恢复上线');
          fetchOfflineHotels();
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
      key: 'name',
      render: (name) => (
        <Space>
          {name}
          <Tag color="warning">已下线</Tag>
        </Space>
      )
    },
    {
      title: '英文名称',
      dataIndex: ['name', 'en'],
      key: 'nameEn'
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
      title: '下线时间',
      dataIndex: 'offlineDate',
      key: 'offlineDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'
    },
    {
      title: '下线原因',
      dataIndex: 'offlineReason',
      key: 'offlineReason',
      render: (reason) => reason || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<RollbackOutlined />}
          onClick={() => handleRestore(record._id)}
        >
          恢复上线
        </Button>
      )
    }
  ];

  return (
    <div>
      <h2>下线酒店管理</h2>
      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}

export default OfflineHotels;
