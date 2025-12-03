import { useState, useEffect } from 'react';
import { Card, Descriptions, Tag, Spin, message, Empty } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/authStore';
import { userApi } from '@/utils/api';
import { User } from '@/types';
import dayjs from 'dayjs';

export default function Profile() {
  const { user: authUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authUser?.id) {
      loadUser();
    } else {
      setUser(authUser);
    }
  }, [authUser]);

  const loadUser = async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const response = await userApi.getUser(String(authUser.id));
      if (response.code === 200) {
        setUser(response as any);
      }
    } catch (error: any) {
      message.error(error.message || '加载用户信息失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  const displayUser = user || authUser;
  if (!displayUser) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <Empty description="未登录" />
        </Card>
      </div>
    );
  }

  const getRoleText = (role: number) => {
    const roleMap: Record<number, string> = {
      1: '普通用户',
      2: '管理员',
    };
    return roleMap[role] || '未知';
  };

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <UserOutlined style={{ fontSize: 20 }} />
            <span>个人信息</span>
          </div>
        }
        style={{ borderRadius: 12 }}
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="用户名">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserOutlined />
              {displayUser.username}
            </div>
          </Descriptions.Item>

          <Descriptions.Item label="邮箱">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MailOutlined />
              {displayUser.email}
            </div>
          </Descriptions.Item>

          {displayUser.telephone && (
            <Descriptions.Item label="手机号">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <PhoneOutlined />
                {displayUser.telephone}
              </div>
            </Descriptions.Item>
          )}

          <Descriptions.Item label="角色">
            <Tag color={displayUser.role === 2 ? 'blue' : 'default'}>
              {displayUser.role_info?.name || getRoleText(displayUser.role)}
            </Tag>
          </Descriptions.Item>

          {displayUser.role_info && (
            <Descriptions.Item label="角色描述">
              {displayUser.role_info.description || '无'}
            </Descriptions.Item>
          )}

          {displayUser.permissions && displayUser.permissions.length > 0 && (
            <Descriptions.Item label="权限列表">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {displayUser.permissions.map((perm) => (
                  <Tag key={perm.id} color="cyan">
                    {perm.name} ({perm.code})
                  </Tag>
                ))}
              </div>
            </Descriptions.Item>
          )}

          {displayUser.createdAt && (
            <Descriptions.Item label="注册时间">
              {dayjs(displayUser.createdAt).format('YYYY-MM-DD HH:mm:ss')}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  );
}

