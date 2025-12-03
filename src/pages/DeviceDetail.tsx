import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Spin, message, Empty } from 'antd';
import { ArrowLeftOutlined, DesktopOutlined } from '@ant-design/icons';
import { deviceApi } from '@/utils/api';
import { DeviceDetail as DeviceDetailType } from '@/types';
import dayjs from 'dayjs';

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [device, setDevice] = useState<DeviceDetailType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadDevice();
    }
  }, [id]);

  const loadDevice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await deviceApi.getDevice(id);
      if (response && response.code === 200) {
        // 后端返回的数据结构可能不同，需要适配
        const deviceData = response as any;
        setDevice(deviceData);
      } else {
        message.error(response?.message || '设备不存在');
        navigate('/devices');
      }
    } catch (error: any) {
      console.error('加载设备详情错误:', error);
      const errorMessage = error?.response?.data?.message || error?.message || '加载设备详情失败';
      message.error(errorMessage);
      navigate('/devices');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      online: { color: 'success', text: '在线' },
      offline: { color: 'default', text: '离线' },
      maintenance: { color: 'warning', text: '维护中' },
    };
    const statusInfo = statusMap[status] || statusMap.offline;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!device) {
    return (
      <div style={{ padding: '24px' }}>
        <Empty description="设备不存在" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/devices')}
        style={{ marginBottom: 24 }}
      >
        返回列表
      </Button>

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <DesktopOutlined style={{ fontSize: 20 }} />
            <span>{device.name}</span>
            {getStatusTag(device.status)}
          </div>
        }
        style={{ borderRadius: 12 }}
      >
        <Descriptions column={2} bordered>
          <Descriptions.Item label="设备ID">{device.device_id}</Descriptions.Item>
          <Descriptions.Item label="MAC地址">{device.mac}</Descriptions.Item>
          <Descriptions.Item label="IP地址">{device.ip}</Descriptions.Item>
          <Descriptions.Item label="状态">{getStatusTag(device.status)}</Descriptions.Item>

          {device.cpu && typeof device.cpu === 'object' && (
            <>
              <Descriptions.Item label="CPU型号">{device.cpu.model || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="CPU核心数">{device.cpu.cores || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="CPU线程数">{device.cpu.threads || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="CPU频率">{device.cpu.frequency || 'N/A'}</Descriptions.Item>
            </>
          )}
          {device.cpu && typeof device.cpu === 'string' && (
            <Descriptions.Item label="CPU">{device.cpu}</Descriptions.Item>
          )}

          {device.memory && typeof device.memory === 'object' && (
            <>
              <Descriptions.Item label="总内存">
                {device.memory.total_gb ? `${device.memory.total_gb} GB` : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="可用内存">
                {device.memory.available_gb ? `${device.memory.available_gb} GB` : 'N/A'}
              </Descriptions.Item>
            </>
          )}
          {device.memory && typeof device.memory === 'string' && (
            <Descriptions.Item label="内存">{device.memory}</Descriptions.Item>
          )}

          {device.motherboard && (
            <>
              <Descriptions.Item label="主板型号">{device.motherboard.model || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="主板制造商">{device.motherboard.manufacturer || 'N/A'}</Descriptions.Item>
            </>
          )}

          {device.os && typeof device.os === 'object' && (
            <>
              <Descriptions.Item label="操作系统类型">{device.os.type || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="操作系统版本">{device.os.version || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="系统架构">{device.os.arch || 'N/A'}</Descriptions.Item>
            </>
          )}
          {device.os && typeof device.os === 'string' && (
            <Descriptions.Item label="操作系统">{device.os}</Descriptions.Item>
          )}

          {device.disk && Array.isArray(device.disk) && device.disk.length > 0 && (
            <Descriptions.Item label="硬盘信息" span={2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {device.disk.map((disk, index) => (
                  <div key={index} style={{ padding: 8, background: '#f5f5f5', borderRadius: 4 }}>
                    <div>设备: {disk.device}</div>
                    <div>总容量: {disk.total ? `${(disk.total / (1024 ** 3)).toFixed(2)} GB` : 'N/A'}</div>
                    <div>可用容量: {disk.available ? `${(disk.available / (1024 ** 3)).toFixed(2)} GB` : 'N/A'}</div>
                    {disk.filesystem && <div>文件系统: {disk.filesystem}</div>}
                  </div>
                ))}
              </div>
            </Descriptions.Item>
          )}
          {device.disk && typeof device.disk === 'string' && (
            <Descriptions.Item label="硬盘">{device.disk}</Descriptions.Item>
          )}

          <Descriptions.Item label="创建时间">
            {device.createdAt ? dayjs(device.createdAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {device.updatedAt ? dayjs(device.updatedAt).format('YYYY-MM-DD HH:mm:ss') : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
}

