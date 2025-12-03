import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import { authApi } from '@/utils/api';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: { telephone: string; username: string; email?: string; password: string }) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: async (username: string, password: string) => {
        console.log('[AuthStore] 开始登录请求，用户名:', username);
        const response = await authApi.login(username, password);
        console.log('[AuthStore] 登录接口原始响应:', response);
        console.log('[AuthStore] 响应类型:', typeof response);
        console.log('[AuthStore] 响应是否为 AxiosResponse:', response && typeof (response as any).data !== 'undefined');
        console.log('[AuthStore] 响应是否有 data 属性:', 'data' in (response as any));
        console.log('[AuthStore] 响应是否有 code 属性:', 'code' in (response as any));
        console.log('[AuthStore] 响应是否有 message 属性:', 'message' in (response as any));
        
        // 响应拦截器已经返回了 data，所以 response 就是数据对象
        // 但如果 response 仍然是 AxiosResponse，需要提取 data
        let responseData: any;
        if (response && typeof (response as any).data !== 'undefined' && !('code' in response)) {
          // 如果 response 是 AxiosResponse，提取 data
          console.log('[AuthStore] 响应是 AxiosResponse，提取 data');
          responseData = (response as any).data;
        } else {
          // 如果 response 已经是数据对象，直接使用
          console.log('[AuthStore] 响应已经是数据对象，直接使用');
          responseData = response;
        }
        
        console.log('[AuthStore] 处理后的响应数据:', responseData);
        console.log('[AuthStore] 响应数据 code:', responseData?.code);
        console.log('[AuthStore] 响应数据 message:', responseData?.message);
        console.log('[AuthStore] 响应数据 data:', responseData?.data);
        console.log('[AuthStore] 响应数据完整结构:', JSON.stringify(responseData, null, 2));
        
        if (responseData && responseData.code === 200 && responseData.data) {
          const { token, user_info } = responseData.data;
          console.log('[AuthStore] 提取的 token:', token ? `${token.substring(0, 20)}...` : 'null');
          console.log('[AuthStore] 提取的 user_info:', user_info);
          
          const user: User = {
            id: user_info.id,
            username: user_info.username,
            email: user_info.email,
            role: user_info.role,
            role_id: user_info.role_id,
            role_info: user_info.role_info,
            permissions: user_info.permissions,
          };
          console.log('[AuthStore] 构建的用户对象:', user);
          
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true });
          console.log('[AuthStore] 登录成功，用户已保存到状态');
        } else {
          console.error('[AuthStore] 登录失败，响应数据:', responseData);
          throw new Error(responseData?.message || '登录失败');
        }
      },
      register: async (data: { telephone: string; username: string; email?: string; password: string }) => {
        console.log('[AuthStore] 开始注册请求，数据:', { ...data, password: '***' });
        const response = await authApi.register(data);
        console.log('[AuthStore] 注册接口原始响应:', response);
        console.log('[AuthStore] 响应类型:', typeof response);
        console.log('[AuthStore] 响应是否为 AxiosResponse:', response && typeof (response as any).data !== 'undefined');
        console.log('[AuthStore] 响应是否有 data 属性:', 'data' in (response as any));
        console.log('[AuthStore] 响应是否有 code 属性:', 'code' in (response as any));
        console.log('[AuthStore] 响应是否有 message 属性:', 'message' in (response as any));
        
        // 响应拦截器已经返回了 data，所以 response 就是数据对象
        // 但如果 response 仍然是 AxiosResponse，需要提取 data
        let responseData: any;
        if (response && typeof (response as any).data !== 'undefined' && !('code' in response)) {
          // 如果 response 是 AxiosResponse，提取 data
          console.log('[AuthStore] 响应是 AxiosResponse，提取 data');
          responseData = (response as any).data;
        } else {
          // 如果 response 已经是数据对象，直接使用
          console.log('[AuthStore] 响应已经是数据对象，直接使用');
          responseData = response;
        }
        
        console.log('[AuthStore] 处理后的响应数据:', responseData);
        console.log('[AuthStore] 响应数据 code:', responseData?.code);
        console.log('[AuthStore] 响应数据 message:', responseData?.message);
        console.log('[AuthStore] 响应数据 data:', responseData?.data);
        console.log('[AuthStore] 响应数据完整结构:', JSON.stringify(responseData, null, 2));
        
        if (responseData && responseData.code === 200 && responseData.data) {
          console.log('[AuthStore] 注册成功，准备自动登录');
          // 注册成功后自动登录
          await useAuthStore.getState().login(data.username, data.password);
        } else {
          console.error('[AuthStore] 注册失败，响应数据:', responseData);
          throw new Error(responseData?.message || '注册失败');
        }
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false });
      },
      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

