import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Space, Tag, Typography, message, Spin } from 'antd';
import { ArrowLeftOutlined, ExpandOutlined, CompressOutlined } from '@ant-design/icons';
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const previousVideoStatsRef = useRef<{
    timestamp: number;
    bytesReceived: number;
  } | null>(null);
  const lastBitrateRef = useRef(0);
  const [inputEnabled, setInputEnabled] = useState(false);
  const inputEnabledRef = useRef(false);
  const [_networkStats, setNetworkStats] = useState<{
    packetsLost: number;
    packetsReceived: number;
    packetLossRate: number;
    bitrateKbps: number;
    framesPerSecond: number;
    latencyMs: number;
    decodeLatencyMs: number;
    renderLatencyMs: number;
    jitterMs: number;
    framesDecoded: number;
    framesDropped: number;
    keyFramesDecoded: number;
    firCount: number;
    pliCount: number;
    nackCount: number;
    qpSum: number;
    codec: string;
    totalBytesMB: number;
    availableIncomingBitrate: number;
    availableOutgoingBitrate: number;
  }>({
    packetsLost: 0,
    packetsReceived: 0,
    packetLossRate: 0,
    bitrateKbps: 0,
    framesPerSecond: 0,
    latencyMs: 0,
    decodeLatencyMs: 0,
    renderLatencyMs: 0,
    jitterMs: 0,
    framesDecoded: 0,
    framesDropped: 0,
    keyFramesDecoded: 0,
    firCount: 0,
    pliCount: 0,
    nackCount: 0,
    qpSum: 0,
    codec: '',
    totalBytesMB: 0,
    availableIncomingBitrate: 0,
    availableOutgoingBitrate: 0,
  });

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
    if (dataChannelRef.current) {
      try {
        dataChannelRef.current.close();
      } catch (error) {
        console.warn('关闭 DataChannel 异常：', error);
      }
      dataChannelRef.current = null;
    }

    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream | null;
      stream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (statsIntervalRef.current) {
      window.clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }
    previousVideoStatsRef.current = null;
  };

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement = document.fullscreenElement;
      setIsFullscreen(fullscreenElement === videoContainerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const container = videoContainerRef.current;
    if (!container) {
      return;
    }
    if (!document.fullscreenElement) {
      container.requestFullscreen?.().catch((error) => {
        console.error('进入全屏失败:', error);
        message.error('进入全屏失败，请检查浏览器权限。');
      });
    } else if (document.fullscreenElement === container) {
      document.exitFullscreen?.().catch((error) => {
        console.error('退出全屏失败:', error);
        message.error('退出全屏失败。');
      });
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  const toggleInputForwarding = useCallback(() => {
    setInputEnabled((prev) => {
      const next = !prev;
      inputEnabledRef.current = next;
      if (next) {
        message.success('已恢复发送键鼠事件');
      } else {
        message.warning('已禁止发送键鼠事件');
      }
      return next;
    });
  }, []);

  const MessageType = useRef({
    IFrameRequest: 0,
    RequestQualityControl: 1,
    MaxFpsRequest: 2,
    AverageBitrateRequest: 3,
    StartStreaming: 4,
    StopStreaming: 5,
    LatencyTest: 6,
    RequestInitialSettings: 7,
    UIInteraction: 50,
    Command: 51,
    KeyDown: 60,
    KeyUp: 61,
    KeyPress: 62,
    MouseEnter: 70,
    MouseLeave: 71,
    MouseDown: 72,
    MouseUp: 73,
    MouseMove: 74,
    MouseWheel: 75,
    TouchStart: 80,
    TouchEnd: 81,
    TouchMove: 82,
    GamepadButtonPressed: 90,
    GamepadButtonReleased: 91,
    GamepadAnalog: 92,
  }).current;

  const sendInputData = useCallback(
    (buffer: ArrayBuffer) => {
      if (!inputEnabledRef.current) {
        return;
      }
      const channel = dataChannelRef.current;
      if (channel && channel.readyState === 'open') {
        try {
          channel.send(buffer);
        } catch (error) {
          console.warn('发送输入事件失败：', error);
        }
      }
    },
    []
  );

  const emitDescriptor = useCallback(
    (messageType: number, descriptor: Record<string, any>) => {
      const descriptorAsString = JSON.stringify(descriptor);
      const buffer = new ArrayBuffer(1 + 2 + descriptorAsString.length * 2);
      const dataView = new DataView(buffer);
      let byteIdx = 0;
      dataView.setUint8(byteIdx, messageType);
      byteIdx += 1;
      dataView.setUint16(byteIdx, descriptorAsString.length, true);
      byteIdx += 2;
      for (let i = 0; i < descriptorAsString.length; i++) {
        dataView.setUint16(byteIdx, descriptorAsString.charCodeAt(i), true);
        byteIdx += 2;
      }
      sendInputData(buffer);
    },
    [sendInputData]
  );

  const normalizeAndQuantizeUnsigned = useCallback((x: number, y: number) => {
    const clampedX = Math.min(Math.max(x, 0), 1);
    const clampedY = Math.min(Math.max(y, 0), 1);
    return {
      x: Math.min(Math.floor(clampedX * 65535), 65535),
      y: Math.min(Math.floor(clampedY * 65535), 65535),
    };
  }, []);

  const normalizeAndQuantizeSigned = useCallback((x: number, y: number) => {
    const clamp = (value: number) => Math.min(Math.max(value, -1), 1);
    return {
      x: Math.min(Math.floor(clamp(x) * 32767), 32767),
      y: Math.min(Math.floor(clamp(y) * 32767), 32767),
    };
  }, []);

  const emitMouseMove = useCallback(
    (x: number, y: number, deltaX: number, deltaY: number) => {
      const coord = normalizeAndQuantizeUnsigned(x, y);
      const delta = normalizeAndQuantizeSigned(deltaX / 500, deltaY / 500);
      const data = new DataView(new ArrayBuffer(9));
      data.setUint8(0, MessageType.MouseMove);
      data.setUint16(1, coord.x, true);
      data.setUint16(3, coord.y, true);
      data.setInt16(5, delta.x, true);
      data.setInt16(7, delta.y, true);
      sendInputData(data.buffer);
    },
    [MessageType.MouseMove, normalizeAndQuantizeSigned, normalizeAndQuantizeUnsigned, sendInputData]
  );

  const emitMouseButton = useCallback(
    (type: number, button: number, x: number, y: number) => {
      const coord = normalizeAndQuantizeUnsigned(x, y);
      const data = new DataView(new ArrayBuffer(6));
      data.setUint8(0, type);
      data.setUint8(1, button);
      data.setUint16(2, coord.x, true);
      data.setUint16(4, coord.y, true);
      sendInputData(data.buffer);
    },
    [normalizeAndQuantizeUnsigned, sendInputData]
  );

  const emitMouseWheel = useCallback(
    (x: number, y: number, deltaX: number, deltaY: number) => {
      const coord = normalizeAndQuantizeUnsigned(x, y);
      const delta = normalizeAndQuantizeSigned(deltaX / 120, deltaY / 120);
      const data = new DataView(new ArrayBuffer(9));
      data.setUint8(0, MessageType.MouseWheel);
      data.setUint16(1, coord.x, true);
      data.setUint16(3, coord.y, true);
      data.setInt16(5, delta.x, true);
      data.setInt16(7, delta.y, true);
      sendInputData(data.buffer);
    },
    [MessageType.MouseWheel, normalizeAndQuantizeSigned, normalizeAndQuantizeUnsigned, sendInputData]
  );

  const emitKeyboard = useCallback(
    (type: number, event: KeyboardEvent) => {
      emitDescriptor(type, {
        keyCode: event.code,
        key: event.key,
        repeat: event.repeat,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
      });
    },
    [emitDescriptor]
  );

  const normalizePointer = (event: MouseEvent | WheelEvent) => {
    const rect = videoRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: 0, y: 0 };
    }
    const x = Number((((event.clientX - rect.left) / rect.width)).toFixed(4));
    const y = Number((((event.clientY - rect.top) / rect.height)).toFixed(4));
    return {
      x: Math.min(Math.max(x, 0), 1),
      y: Math.min(Math.max(y, 0), 1),
    };
  };

  useEffect(() => {
    const container = videoContainerRef.current;
    if (!container) return;

    const handleMouseMove = (event: MouseEvent) => {
      if (!inputEnabledRef.current) return;
      event.preventDefault();
      const { x, y } = normalizePointer(event);
      emitMouseMove(x, y, event.movementX, event.movementY);
    };

    const handleMouseDown = (event: MouseEvent) => {
      if (!inputEnabledRef.current) return;
      event.preventDefault();
      const { x, y } = normalizePointer(event);
      emitMouseButton(MessageType.MouseDown, event.button, x, y);
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (!inputEnabledRef.current) return;
      event.preventDefault();
      const { x, y } = normalizePointer(event);
      emitMouseButton(MessageType.MouseUp, event.button, x, y);
    };

    const handleMouseWheel = (event: WheelEvent) => {
      if (!inputEnabledRef.current) return;
      event.preventDefault();
      const { x, y } = normalizePointer(event);
      emitMouseWheel(x, y, event.deltaX, event.deltaY);
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!container.contains(document.activeElement) || !inputEnabledRef.current) return;
      event.preventDefault();
      emitKeyboard(MessageType.KeyDown, event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (!container.contains(document.activeElement) || !inputEnabledRef.current) return;
      event.preventDefault();
      emitKeyboard(MessageType.KeyUp, event);
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleMouseWheel, { passive: false });
    container.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.setAttribute('tabindex', '0');
    container.focus();

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleMouseWheel);
      container.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [MessageType.KeyDown, MessageType.KeyUp, emitKeyboard, emitMouseButton, emitMouseMove, emitMouseWheel, normalizePointer]);
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

  const startStatsMonitor = useCallback(() => {
    if (statsIntervalRef.current) {
      window.clearInterval(statsIntervalRef.current);
    }
    statsIntervalRef.current = window.setInterval(async () => {
      const pc = peerConnectionRef.current;
      if (!pc) return;
      try {
        const stats = await pc.getStats();
        const codecMap = new Map<string, string>();
        stats.forEach((report) => {
          if (report.type === 'codec') {
            const labelParts = [report.mimeType, report.sdpFmtpLine].filter(Boolean);
            codecMap.set(report.id, labelParts.join(' ') || `payload:${report.payloadType}`);
          }
        });
        let packetsLost = 0;
        let packetsReceived = 0;
        let framesPerSecond = 0;
        let bytesReceived = 0;
        let timestamp = 0;
        let framesDecoded = 0;
        let totalDecodeTime = 0;
        let totalInterFrameDelay = 0;
        let latencyMs = 0;
        let jitterMs = 0;
        let framesDropped = 0;
        let keyFramesDecoded = 0;
        let firCount = 0;
        let pliCount = 0;
        let nackCount = 0;
        let qpSum = 0;
        let codec = '';
        let availableIncomingBitrate = 0;
        let availableOutgoingBitrate = 0;
        let totalBytesMB = 0;
        stats.forEach((report) => {
          if (report.type === 'inbound-rtp' && report.kind === 'video') {
            packetsLost = report.packetsLost || 0;
            packetsReceived = report.packetsReceived || 0;
            framesPerSecond = report.framesPerSecond || framesPerSecond;
            bytesReceived = report.bytesReceived || bytesReceived;
            timestamp = report.timestamp || timestamp;
            if (typeof report.jitter === 'number') {
              jitterMs = Math.max(jitterMs, report.jitter * 1000);
            }
            framesDecoded = report.framesDecoded || framesDecoded;
            framesDropped = report.framesDropped || framesDropped;
            keyFramesDecoded = report.keyFramesDecoded || keyFramesDecoded;
            firCount = report.firCount || firCount;
            pliCount = report.pliCount || pliCount;
            nackCount = report.nackCount || nackCount;
            qpSum = report.qpSum || qpSum;
            if (!codec && report.codecId) {
              codec = codecMap.get(report.codecId) || codec;
            }
          } else if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
            if (typeof report.roundTripTime === 'number') {
              latencyMs = Math.max(latencyMs, report.roundTripTime * 1000);
            }
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded' && report.nominated) {
            if (typeof report.currentRoundTripTime === 'number') {
              latencyMs = Math.max(latencyMs, report.currentRoundTripTime * 1000);
            }
            if (typeof report.availableIncomingBitrate === 'number') {
              availableIncomingBitrate = report.availableIncomingBitrate / 1000;
            }
            if (typeof report.availableOutgoingBitrate === 'number') {
              availableOutgoingBitrate = report.availableOutgoingBitrate / 1000;
            }
          } else if (report.type === 'transport') {
            if (typeof report.bytesReceived === 'number') {
              totalBytesMB = report.bytesReceived / 1024 / 1024;
            }
            if (typeof report.availableIncomingBitrate === 'number') {
              availableIncomingBitrate = report.availableIncomingBitrate / 1000;
            }
            if (typeof report.availableOutgoingBitrate === 'number') {
              availableOutgoingBitrate = report.availableOutgoingBitrate / 1000;
            }
          } else if (report.type === 'track' && (report as any).kind === 'video') {
            framesDecoded = report.framesDecoded || framesDecoded;
            totalDecodeTime = report.totalDecodeTime || totalDecodeTime;
            totalInterFrameDelay = (report as any).totalInterFrameDelay || totalInterFrameDelay;
            framesDropped = report.framesDropped || framesDropped;
          }
        });
        let bitrateKbps = lastBitrateRef.current;
        if (previousVideoStatsRef.current && timestamp && bytesReceived) {
          const timeDiff = (timestamp - previousVideoStatsRef.current.timestamp) / 1000;
          const bytesDiff = bytesReceived - previousVideoStatsRef.current.bytesReceived;
          if (timeDiff > 0 && bytesDiff >= 0) {
            bitrateKbps = Math.max(0, (bytesDiff * 8) / 1000 / timeDiff);
          }
        }
        if (timestamp && bytesReceived) {
          previousVideoStatsRef.current = { timestamp, bytesReceived };
          totalBytesMB = bytesReceived / 1024 / 1024;
        }
        lastBitrateRef.current = bitrateKbps;
        const packetLossRate =
          packetsLost + packetsReceived > 0 ? packetsLost / (packetsLost + packetsReceived) : 0;
        const decodeLatencyMs =
          framesDecoded > 0 && totalDecodeTime
            ? Math.max(0, (totalDecodeTime / framesDecoded) * 1000)
            : 0;
        const renderLatencyMs =
          framesDecoded > 0 && totalInterFrameDelay
            ? Math.max(0, (totalInterFrameDelay / framesDecoded) * 1000)
            : 0;
        setNetworkStats({
          packetsLost,
          packetsReceived,
          packetLossRate,
          bitrateKbps,
          framesPerSecond,
          latencyMs,
          decodeLatencyMs,
          renderLatencyMs,
          jitterMs,
          framesDecoded,
          framesDropped,
          keyFramesDecoded,
          firCount,
          pliCount,
          nackCount,
          qpSum,
          codec,
          totalBytesMB,
          availableIncomingBitrate,
          availableOutgoingBitrate,
        });
      } catch (error) {
        console.warn('获取 WebRTC 统计信息失败：', error);
      }
    }, 2000);
  }, []);

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

      const channel = pc.createDataChannel('input');
      dataChannelRef.current = channel;
      channel.onopen = () => {
        console.log('DataChannel 已连接');
        setStatusText('数据通道已建立，等待流媒体...');
      };
      channel.onclose = () => {
        console.log('DataChannel 已关闭');
      };
      channel.onerror = (event) => {
        console.error('DataChannel 错误:', event);
      };
      channel.onmessage = (event) => {
        console.log('收到 DataChannel 消息:', event.data);
      };

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
          startStatsMonitor();
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
  }, [device, loading, startStatsMonitor]);

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
          <Button onClick={toggleInputForwarding}>
            {inputEnabled ? '禁止键鼠输入' : '允许键鼠输入'}
          </Button>
          <Button
            icon={isFullscreen ? <CompressOutlined /> : <ExpandOutlined />}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? '退出全屏' : '全屏'}
          </Button>
        </Space>

        <Card>
          <div
            ref={videoContainerRef}
            style={{
              width: '100%',
              background: '#000',
              borderRadius: 12,
              overflow: 'hidden',
              outline: 'none',
              cursor: 'crosshair',
              position: 'relative',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
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

