// 用户信息
export interface User {
  id: number;
  username: string;
  email: string;
  telephone?: string;
  role: number;
  role_id?: number;
  role_info?: {
    id: number;
    name: string;
    code: string;
    description?: string;
    permissions?: Permission[];
  };
  permissions?: Permission[];
  createdAt?: string;
}

// 权限信息
export interface Permission {
  id: number;
  name: string;
  code: string;
  resource: string;
  action: string;
  description?: string;
}

// 设备信息
export interface Device {
  id: string;
  name: string;
  device_id: string;
  ip: string;
  mac: string;
  status: 'online' | 'offline' | 'maintenance';
  cpu: string;
  memory: string;
  disk: string;
  os: string;
  isAssociated?: boolean;  // 是否已通过设备ID和密码添加（已关联）
  isLoggedIn?: boolean;  // 是否已登录但未退出
  userDeviceId?: string | null;  // 用户设备关联ID（用于删除关联）
  createdAt: string;
  updatedAt: string;
}

// 设备详情
export interface DeviceDetail extends Omit<Device, 'cpu' | 'memory' | 'disk' | 'os'> {
  cpu?: string | {
    model?: string;
    cores?: number;
    threads?: number;
    frequency?: string;
  };
  memory?: string | {
    total?: number;
    available?: number;
    total_gb?: number;
    available_gb?: number;
  };
  disk?: string | Array<{
    device: string;
    total: number;
    available: number;
    filesystem?: string;
  }>;
  motherboard?: {
    model?: string;
    manufacturer?: string;
  };
  os?: string | {
    type?: string;
    version?: string;
    arch?: string;
  };
  hardware_info?: Record<string, any>;
}

// 用户设备关联
export interface UserDevice {
  id: string;
  userId: string;
  deviceId: string;  // 数据库主键ID
  device_id?: string;  // 设备唯一标识符（device_id字段）
  deviceName: string;
  assignedAt: string;
  isActive: boolean;
  createdAt?: string;
}
