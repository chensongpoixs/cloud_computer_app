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
        const response = await authApi.login(username, password);
        if (response.code === 200 && response.data) {
          const { token, user_info } = response.data;
          const user: User = {
            id: user_info.id,
            username: user_info.username,
            email: user_info.email,
            role: user_info.role,
            role_id: user_info.role_id,
            role_info: user_info.role_info,
            permissions: user_info.permissions,
          };
          localStorage.setItem('token', token);
          set({ token, user, isAuthenticated: true });
        } else {
          throw new Error(response.message || '登录失败');
        }
      },
      register: async (data: { telephone: string; username: string; email?: string; password: string }) => {
        const response = await authApi.register(data);
        if (response.code === 200 && response.data) {
          // 注册成功后自动登录
          await useAuthStore.getState().login(data.username, data.password);
        } else {
          throw new Error(response.message || '注册失败');
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

