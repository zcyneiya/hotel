import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Space, message, Modal, Input } from 'antd';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { auditService } from '../../services/api';

const { TextArea } = Input;

function AdminAudit() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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
            onClick={() => handleApprove(record._id)}
          >
            通过
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => handleReject(record)}
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
    </div>
  );
}

export default AdminAudit;
