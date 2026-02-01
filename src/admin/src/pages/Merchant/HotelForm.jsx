import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Input, InputNumber, Button, DatePicker, Select, Space, Card, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { hotelService } from '../../services/api';

function HotelForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchHotel();
    }
  }, [id]);

  const fetchHotel = async () => {
    try {
      const res = await hotelService.getHotelById(id);
      const hotel = res.data;
      form.setFieldsValue({
        ...hotel,
        openDate: dayjs(hotel.openDate)
      });
    } catch (error) {
      message.error('获取酒店信息失败');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        openDate: values.openDate.toISOString()
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
          rooms: [{ type: '', price: 0, facilities: [] }]
        }}
      >
        <Form.Item
          label="酒店名称（中文）"
          name={['name', 'cn']}
          rules={[{ required: true, message: '请输入酒店中文名称' }]}
        >
          <Input placeholder="请输入酒店中文名称" />
        </Form.Item>

        <Form.Item
          label="酒店名称（英文）"
          name={['name', 'en']}
        >
          <Input placeholder="请输入酒店英文名称（可选）" />
        </Form.Item>

        <Form.Item
          label="城市"
          name="city"
          rules={[{ required: true, message: '请输入城市' }]}
        >
          <Input placeholder="请输入城市" />
        </Form.Item>

        <Form.Item
          label="地址"
          name="address"
          rules={[{ required: true, message: '请输入地址' }]}
        >
          <Input placeholder="请输入详细地址" />
        </Form.Item>

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

        <Form.Item
          label="开业时间"
          name="openDate"
          rules={[{ required: true, message: '请选择开业时间' }]}
        >
          <DatePicker style={{ width: '100%' }} />
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

        <Card title="房型信息" style={{ marginBottom: 16 }}>
          <Form.List name="rooms">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: '请输入房型' }]}
                    >
                      <Input placeholder="房型名称" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'price']}
                      rules={[{ required: true, message: '请输入价格' }]}
                    >
                      <InputNumber placeholder="价格" min={0} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'facilities']}
                    >
                      <Select mode="tags" placeholder="房间设施" style={{ width: 200 }}>
                        <Select.Option value="独立卫浴">独立卫浴</Select.Option>
                        <Select.Option value="空调">空调</Select.Option>
                        <Select.Option value="电视">电视</Select.Option>
                      </Select>
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
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
    </Card>
  );
}

export default HotelForm;
