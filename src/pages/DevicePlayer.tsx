import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Space, Tag, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { deviceApi } from '@/utils/api';
import { Device } from '@/types';

const { Title, Paragraph, Text } = Typography;

interface LocationState {
  device?: Device;
}

export default function DevicePlayer() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const initialDevice = (location.state as LocationState | undefined)?.device ?? null;

  const [device, setDevice] = useState<Device | null>(initialDevice);
  const [loading, setLoading] = useState(!initialDevice);
  const [statusText, setStatusText] = useState<string>('等待播放...');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const cleanup = () => {
    if (peerConnectionRef.current) {
      try {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.close();
      } catch (error) {
        console.warn('关闭 WebRTC 连接异常：', error);
      }
      peerConnectionRef.current = null;
    }
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    if (!device && id) {
      (async () => {
        try {
          setLoading(true);
          const detail = await deviceApi.getDevice(id);
          const { code, message: msg, ...rest } = detail;
          const normalized: Device = {
            id: String(rest.id ?? id),
            name: (rest as any).name ?? (rest as any).device_name ?? '云电脑',
            device_id: (rest as any).device_id ?? '',
            ip: (rest as any).ip ?? (rest as any).ip_address ?? 'N/A',
            mac: (rest as any).mac ?? (rest as any).mac_address ?? 'N/A',
            status: (rest as any).status ?? 'offline',
            cpu: (rest as any).cpu ?? 'N/A',
            memory: (rest as any).memory ?? 'N/A',
            disk: (rest as any).disk ?? 'N/A',
            os: (rest as any).os ?? 'N/A',
            createdAt: (rest as any).createdAt ?? (rest as any).created_at ?? '',
            updatedAt: (rest as any).updatedAt ?? (rest as any).updated_at ?? (rest as any).createdAt ?? '',
            isAssociated: (rest as any).isAssociated,
            isLoggedIn: (rest as any).isLoggedIn,
            userDeviceId: (rest as any).userDeviceId ?? null,
          };
          setDevice(normalized);
        } catch (error: any) {
          message.error(error?.message || '获取设备信息失败');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [device, id]);

  useEffect(() => {
    const startWebRTC = async () => {
      if (!device?.device_id || !videoRef.current) {
        message.error('视频组件未就绪或缺少 device_id，无法发起播放。');
        return;
      }

      cleanup();
      setStatusText('正在建立 WebRTC 连接...');
      console.log('========== WebRTC 播放开始 ==========');
      console.log('目标设备:', device);

      const pc = new RTCPeerConnection({});
      peerConnectionRef.current = pc;
      const remoteStream = new MediaStream();
      videoRef.current.srcObject = remoteStream;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          videoRef.current!.srcObject = event.streams[0];
        } else {
          remoteStream.addTrack(event.track);
        }
      };

      pc.onconnectionstatechange = () => {
        console.log('WebRTC 连接状态：', pc.connectionState);
        if (pc.connectionState === 'connected') {
          setStatusText('播放中');
        } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          setStatusText('连接已断开');
          message.error('WebRTC 连接中断');
          cleanup();
        }
      };

      pc.addTransceiver('audio', { direction: 'recvonly' });
      pc.addTransceiver('video', { direction: 'recvonly' });

      try {
        const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
        await pc.setLocalDescription(offer);
        console.log('本地 SDP (offer):', offer.sdp);

        const payload = {
          type: 'offer',
          caputretype: 1,
          sdp: offer.sdp,
          streamurl: `webrtc://127.0.0.1/live/${device.device_id}`,
        };
        console.log('发送播放请求 payload:', payload);

        const response = await fetch('http://192.168.9.172:8001/rtc/play', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        console.log('播放接口响应状态:', response.status);

        if (!response.ok) {
          throw new Error(`播放接口返回错误：${response.status}`);
        }

        const answerJson = await response.json();
        console.log('播放接口返回数据:', answerJson);
        const answerSdp = answerJson?.sdp || answerJson?.data?.sdp;
        if (!answerSdp) {
          throw new Error('播放接口未返回有效的 SDP 应答。');
        }

        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
        console.log('远端 SDP 已设置');
        setStatusText('正在播放...');
      } catch (error: any) {
        console.error('WebRTC 播放失败:', error);
        message.error(error?.message || 'WebRTC 播放失败');
        setStatusText('播放失败');
        cleanup();
      }
    };

    if (device && !loading) {
      startWebRTC();
    }
  }, [device, loading]);

  if (loading || !device) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size="large" tip="加载设备信息..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {device.name || '云电脑'} - 实时预览
          </Title>
          <Tag color={device.status === 'online' ? 'green' : device.status === 'maintenance' ? 'orange' : 'default'}>
            {device.status === 'online' ? '在线' : device.status === 'maintenance' ? '维护中' : '离线'}
          </Tag>
        </Space>

        <Card>
          <div
            style={{
              width: '100%',
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              controls
              playsInline
              style={{
                width: '100%',
                minHeight: 480,
                background: '#000',
              }}
            />
          </div>
          <Paragraph style={{ marginTop: 16 }}>
            <Text type="secondary">播放状态：</Text>
            <Text>{statusText}</Text>
          </Paragraph>
        </Card>

        <Card title="设备信息">
          <Space direction="vertical" size={8}>
            <Text>设备 ID：{device.device_id}</Text>
            <Text>IP 地址：{device.ip}</Text>
            <Text>MAC 地址：{device.mac}</Text>
            <Text>CPU：{device.cpu}</Text>
            <Text>内存：{device.memory}</Text>
            <Text>磁盘：{device.disk}</Text>
            <Text>系统：{device.os}</Text>
            <Text>创建时间：{device.createdAt}</Text>
          </Space>
        </Card>
      </Space>
    </div>
  );
}

