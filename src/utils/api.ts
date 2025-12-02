import axios from 'axios';
import { Device, DeviceDetail, User } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://192.168.9.172:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    const data = response.data;
    if (data && typeof data === 'object' && 'code' in data) {
      // code: 0 表示成功（用于统一响应格式）
      // code: 200 或 201 也表示成功（用于传统响应格式）
      if (data.code === 0 || data.code === 200 || data.code === 201) {
        return data as any;
      } else if (data.code === 401) {
        const error: any = new Error(data.message || '未授权');
        error.response = { status: 401, data };
        return Promise.reject(error);
      } else {
        // 对于其他非零 code，也返回数据，让调用方自己判断
        // 因为后端统一返回 HTTP 200，错误信息在 code 字段中
        return data as any;
      }
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || error.request?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('网络连接失败，请检查后端服务是否启动'));
    }
    return Promise.reject(error);
  }
);

// 认证API
export const authApi = {
  // 用户登录
  login: (username: string, password: string) => {
    return api.post<{
      code: number;
      message: string;
      data: {
        token: string;
        user_info: {
          id: number;
          username: string;
          email: string;
          role: number;
          role_id?: number;
          role_info?: any;
          permissions?: any[];
        };
      };
    }>('/auth/login', { username, password });
  },
  // 用户注册（手机号注册）
  register: (data: { telephone: string; username: string; email?: string; password: string }) => {
    return api.post<{
      code: number;
      message: string;
      data: {
        id: number;
        username: string;
        email: string;
        telephone: string;
        role: number;
      };
    }>('/auth/register', data);
  },
};

// 设备API
export const deviceApi = {
  // 获取设备列表
  getDevices: async (params?: { page?: number; pageSize?: number; status?: string; my_devices_only?: boolean }) => {
    try {
      const response = await api.get<{ code: number; message: string; list: Device[]; total: number }>('/devices', { params });
      return response as { code: number; message: string; list: Device[]; total: number };
    } catch (error: any) {
      // 如果是401错误，让拦截器处理
      if (error.response?.status === 401) {
        throw error;
      }
      // 其他错误，返回一个默认结构
      throw new Error(error.response?.data?.message || error.message || '获取设备列表失败');
    }
  },

  // 获取设备详情
  getDevice: async (id: string) => {
    try {
      const response = await api.get<DeviceDetail & { code: number; message: string }>(`/devices/${id}`);
      return response as DeviceDetail & { code: number; message: string };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || '获取设备详情失败');
    }
  },
};

// 用户API
export const userApi = {
  // 获取用户详情
  getUser: (id: string) => {
    return api.get<User & { code: number; message: string }>(`/users/${id}`) as unknown as Promise<User & { code: number; message: string }>;
  },
};

// 用户设备关联API
export const userDeviceApi = {
  // 获取当前用户关联的设备列表
  getMyDevices: async () => {
    try {
      const response = await api.get<{ code: number; message: string; list: UserDevice[] }>('/user-devices/my-devices');
      return response as { code: number; message: string; list: UserDevice[] };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || '获取设备列表失败');
    }
  },

  // 关联设备（通过设备ID和密码）
  associateDevice: async (deviceId: string, password: string) => {
    try {
      // 响应拦截器已经处理了数据，直接返回响应数据
      const response = await api.post<{ code: number; message: string; data?: any }>('/user-devices/associate', {
        device_id: deviceId,
        password: password,
      });
      // 响应拦截器返回的已经是 data 对象，直接返回
      return response as { code: number; message: string; data?: any };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      // 如果后端返回了错误信息，从响应中提取
      if (error.response?.data) {
        // 如果错误响应中有 code 和 message，返回统一格式
        if (error.response.data.code !== undefined && error.response.data.message) {
          return error.response.data as { code: number; message: string; data?: any };
        }
        throw new Error(error.response.data.message || '关联设备失败');
      }
      throw new Error(error.message || '关联设备失败');
    }
  },

  // 取消设备关联
  unassociateDevice: async (userDeviceId: string) => {
    try {
      const response = await api.delete<{ code: number; message: string }>(`/user-devices/${userDeviceId}`);
      return response as { code: number; message: string };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw error;
      }
      throw new Error(error.response?.data?.message || error.message || '取消关联失败');
    }
  },
};

export default api;

