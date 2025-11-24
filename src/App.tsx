import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import DeviceList from '@/pages/DeviceList';
import DeviceDetail from '@/pages/DeviceDetail';
import Profile from '@/pages/Profile';

const { defaultAlgorithm } = theme;

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: defaultAlgorithm,
        token: {
          // Apple 风格颜色
          colorPrimary: '#0071e3',
          colorSuccess: '#34c759',
          colorWarning: '#ff9500',
          colorError: '#ff3b30',
          colorInfo: '#0071e3',
          
          // 字体
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
          fontSize: 14,
          
          // 圆角
          borderRadius: 12,
          
          // 阴影
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
          boxShadowSecondary: '0 8px 32px rgba(0, 0, 0, 0.1)',
          
          // 间距
          padding: 16,
          paddingLG: 24,
          
          // 背景
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorBgLayout: '#f5f5f7',
        },
        components: {
          Layout: {
            bodyBg: '#f5f5f7',
            headerBg: 'rgba(255, 255, 255, 0.8)',
            headerPadding: '0 32px',
            siderBg: 'rgba(29, 29, 31, 0.95)',
          },
          Menu: {
            itemBorderRadius: 8,
            itemMarginInline: 8,
            itemMarginBlock: 4,
            subMenuItemBorderRadius: 8,
          },
          Card: {
            borderRadius: 18,
            paddingLG: 32,
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
          },
          Button: {
            borderRadius: 10,
            paddingContentHorizontal: 24,
            paddingContentVertical: 8,
            fontWeight: 500,
            boxShadow: 'none',
          },
          Input: {
            borderRadius: 10,
            paddingBlock: 12,
            paddingInline: 16,
          },
          Table: {
            borderRadius: 12,
            headerBg: '#fafafa',
            headerBorderRadius: 12,
          },
        },
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/devices" replace />} />
            <Route path="devices" element={<DeviceList />} />
            <Route path="devices/:id" element={<DeviceDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

