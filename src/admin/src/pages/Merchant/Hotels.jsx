import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Tag, Space, message, Modal } from 'antd';
import { PlusOutlined, EditOutlined, SendOutlined, EyeOutlined } from '@ant-design/icons';
import { hotelService } from '../../services/api';

const statusMap = {
  draft: { text: '草稿', color: 'default' },
  pending: { text: '待审核', color: 'processing' },
  published: { text: '已发布', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  offline: { text: '已下线', color: 'default' }
};

function MerchantHotels() {
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const res = await hotelService.getMerchantHotels();
      setHotels(res.data);
    } catch (error) {
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSubmit = async (id) => {
    Modal.confirm({
      title: '确认提交审核？',
      content: '提交后将无法修改，请确认信息无误',
      onOk: async () => {
        try {
          await hotelService.submitForReview(id);
          message.success('已提交审核');
          fetchHotels();
        } catch (error) {
          message.error('提交失败');
        }
      }
    });
  };

  const columns = [
    {
      title: '酒店名称',
      dataIndex: ['name', 'cn'],
      key: 'name',
      render: (name, record) => (
        <Space>
          {name}
          {record.status === 'offline' && <Tag color="warning">已下线</Tag>}
        </Space>
      )
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
      title: '房型/空闲',
      key: 'rooms',
      render: (_, record) => {
        if (!record.rooms || record.rooms.length === 0) {
          return '-';
        }
        return (
          <Space direction="vertical" size="small">
            {record.rooms.map((room, index) => (
              <div key={index}>
                {room.type}: {room.availableRooms}/{room.totalRooms}
              </div>
            ))}
          </Space>
        );
      }
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
      title: '驳回原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      render: (reason) => reason || '-'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'published' && (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/merchant/hotels/view/${record._id}`)}
            >
              查看详情
            </Button>
          )}
          {(record.status === 'draft' || record.status === 'rejected') && (
            <>
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => navigate(`/merchant/hotels/edit/${record._id}`)}
              >
                编辑
              </Button>
              <Button
                type="link"
                icon={<SendOutlined />}
                onClick={() => handleSubmit(record._id)}
              >
                提交审核
              </Button>
            </>
          )}
          {record.status === 'offline' && (
            <Tag color="red">已被下线</Tag>
          )}
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/merchant/hotels/new')}
        >
          新增酒店
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="_id"
        loading={loading}
      />
    </div>
  );
}

export default MerchantHotels;
