import { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Input, Select, Empty, Spin, message, Switch, Modal, Form, Popconfirm } from 'antd';
import { DesktopOutlined, SearchOutlined, ReloadOutlined, CheckCircleOutlined, PlusOutlined, LockOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { deviceApi, userDeviceApi } from '@/utils/api';
import { Device } from '@/types';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [myDevicesOnly, setMyDevicesOnly] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [associating, setAssociating] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const loadDevices = async () => {
    setLoading(true);
    try {
      const response = await deviceApi.getDevices({
        page,
        pageSize,
        status: statusFilter || undefined,
        my_devices_only: myDevicesOnly,
      });
      if (response && response.code === 200) {
        const deviceList = response.list || [];
        // 调试：打印设备数据，检查 userDeviceId
        console.log('设备列表数据:', deviceList);
        if (deviceList.length > 0) {
          console.log('第一个设备数据:', deviceList[0]);
          console.log('第一个设备的 isAssociated:', deviceList[0].isAssociated);
          console.log('第一个设备的 userDeviceId:', deviceList[0].userDeviceId);
        }
        setDevices(deviceList);
        setTotal(response.total || 0);
      } else {
        message.error(response?.message || '获取设备列表失败');
        setDevices([]);
        setTotal(0);
      }
    } catch (error: any) {
      console.error('加载设备列表错误:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '加载设备列表失败，请检查网络连接';
      message.error(errorMessage);
      setDevices([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, [page, statusFilter, myDevicesOnly]);

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      online: { color: 'success', text: '在线' },
      offline: { color: 'default', text: '离线' },
      maintenance: { color: 'warning', text: '维护中' },
    };
    const statusInfo = statusMap[status] || statusMap.offline;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const handleDeviceClick = (device: Device) => {
    navigate(`/devices/${device.id}`);
  };

  const handleAddDevice = () => {
    form.resetFields();
    setModalVisible(true);
  };

  const handleAssociateSubmit = async (values: { device_id: string; password: string }) => {
    setAssociating(true);
    try {
      const response = await userDeviceApi.associateDevice(values.device_id, values.password);
      console.log('添加设备响应:', response);
      // 检查 code 字段，0 表示成功
      if (response && response.code === 0) {
        // 根据 message 判断是新增还是已存在
        if (response.message === '已经添加过设备了') {
          message.warning(response.message);
        } else {
          message.success(response.message || '设备添加成功');
        }
        // 立即关闭弹窗
        setModalVisible(false);
        // 重置表单
        form.resetFields();
        // 刷新设备列表
        loadDevices();
      } else {
        // code 不为 0 表示失败
        message.error(response?.message || '添加设备失败');
      }
    } catch (error: any) {
      console.error('添加设备错误:', error);
      // 处理网络错误或其他异常
      const errorMessage = error?.response?.data?.message || error?.message || '添加设备失败';
      message.error(errorMessage);
    } finally {
      setAssociating(false);
    }
  };

  const handleUnassociateDevice = async (device: Device, e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止点击事件冒泡到卡片
    if (!device.userDeviceId) {
      message.error('无法获取关联ID');
      return;
    }
    try {
      const response = await userDeviceApi.unassociateDevice(device.userDeviceId);
      if (response && response.code === 0) {
        message.success(response.message || '删除关联成功');
        loadDevices(); // 刷新设备列表
      } else {
        message.error(response?.message || '删除关联失败');
      }
    } catch (error: any) {
      console.error('删除关联错误:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '删除关联失败';
      message.error(errorMessage);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>设备列表</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddDevice}
          >
            添加设备
          </Button>
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="筛选状态"
            allowClear
            style={{ width: 150 }}
          >
            <Option value="online">在线</Option>
            <Option value="offline">离线</Option>
            <Option value="maintenance">维护中</Option>
          </Select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#666' }}>仅显示已添加的设备：</span>
            <Switch
              checked={myDevicesOnly}
              onChange={setMyDevicesOnly}
            />
            <span style={{ fontSize: 12, color: '#999', marginLeft: 8 }}>
              （关闭时显示已登录或已添加的设备）
            </span>
          </div>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadDevices}
            loading={loading}
          >
            刷新
          </Button>
        </div>
      </div>

      <Spin spinning={loading}>
        {devices.length === 0 ? (
          <Empty description="暂无设备" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={devices}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: setPage,
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 台设备`,
            }}
            renderItem={(device) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleDeviceClick(device)}
                  style={{
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                  }}
                  bodyStyle={{ padding: 20 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                    <DesktopOutlined style={{ fontSize: 24, color: '#667eea', marginRight: 12 }} />
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{device.name}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#999' }}>
                        {device.device_id}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      {getStatusTag(device.status)}
                      {device.isLoggedIn && (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          已登录
                        </Tag>
                      )}
                      {device.isAssociated && (
                        <Tag color="blue" icon={<CheckCircleOutlined />}>
                          已添加
                        </Tag>
                      )}
                    </div>
                    {device.isAssociated && (
                      <Popconfirm
                        title="确定要删除此设备的关联吗？"
                        description="删除后需要重新输入设备ID和密码才能添加"
                        onConfirm={(e) => handleUnassociateDevice(device, e as any)}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="确定"
                        cancelText="取消"
                        disabled={!device.userDeviceId}
                      >
                        <Button
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={(e) => e.stopPropagation()}
                          style={{ marginLeft: 'auto' }}
                          disabled={!device.userDeviceId}
                          title={!device.userDeviceId ? '无法获取关联ID' : '删除关联'}
                        >
                          删除关联
                        </Button>
                      </Popconfirm>
                    )}
                  </div>

                  <div style={{ fontSize: 13, color: '#666', lineHeight: 1.8 }}>
                    <div>IP: {device.ip}</div>
                    <div>CPU: {device.cpu}</div>
                    <div>内存: {device.memory}</div>
                    <div>系统: {device.os}</div>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 12, color: '#999' }}>
                    创建时间: {dayjs(device.createdAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Spin>

      <Modal
        title="添加设备"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
        destroyOnClose={true}
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAssociateSubmit}
          autoComplete="off"
        >
          <Form.Item
            name="device_id"
            label="设备ID"
            rules={[
              { required: true, message: '请输入设备ID' },
            ]}
          >
            <Input
              placeholder="请输入设备ID（device_id）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="设备密码"
            rules={[
              { required: true, message: '请输入设备密码' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入设备密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={associating}
              block
              size="large"
            >
              添加设备
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

