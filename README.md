# 云电脑用户端界面

云电脑系统的用户端前端界面，提供用户登录、注册、设备查看等功能。

## 功能特性

### 1. 用户认证
- 用户登录（用户名/密码）
- 用户注册（手机号注册）
- 自动登录状态保持

### 2. 设备管理
- 设备列表查看（支持分页）
- 设备详情查看
- 设备状态筛选（在线/离线/维护中）
- 设备信息展示（CPU、内存、硬盘、操作系统等）

### 3. 个人信息
- 查看个人信息
- 查看角色和权限

## 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Ant Design 5** - UI组件库
- **React Router 6** - 路由管理
- **Zustand** - 状态管理
- **Axios** - HTTP客户端
- **Day.js** - 日期处理
- **Vite** - 构建工具

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3001` 启动。

### 启用 HTTPS（可选）

项目提供 `config/devServer.config.json` 以控制本地开发服务器的 Host、Port 以及 HTTPS 证书信息。示例配置：

```json
{
  "host": "localhost",
  "port": 3001,
  "open": true,
  "https": {
    "enable": true,
    "keyPath": "./certs/dev-key.pem",
    "certPath": "./certs/dev-cert.pem",
    "caPath": ""
  }
}
```

1. 将自签名或有效证书放在 `config` 目录外（例如 `certs/`）。
2. 设置 `enable: true`，并填写对应的 `keyPath` / `certPath`（支持相对路径）。
3. 执行 `npm run dev` 时，Vite 会自动按配置启用 HTTPS；若证书路径缺失会回退到 HTTP 并给出提示。

### 构建生产版本

```bash
npm run build
```

## 环境配置

创建 `.env` 文件配置后端API地址：

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

## 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.tsx      # 主布局
│   └── ProtectedRoute.tsx  # 路由守卫
├── pages/              # 页面组件
│   ├── Login.tsx       # 登录页
│   ├── Register.tsx    # 注册页
│   ├── DeviceList.tsx  # 设备列表
│   ├── DeviceDetail.tsx  # 设备详情
│   └── Profile.tsx     # 个人信息
├── store/              # 状态管理
│   └── authStore.ts    # 认证状态
├── types/              # 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   └── api.ts         # API接口
├── App.tsx            # 主应用组件
└── main.tsx           # 入口文件
```

## API接口说明

所有API接口定义在 `src/utils/api.ts` 中，包括：

- `authApi` - 认证相关接口（登录、注册）
- `deviceApi` - 设备管理相关接口
- `userApi` - 用户管理相关接口

## 路由说明

- `/login` - 登录页
- `/register` - 注册页
- `/devices` - 设备列表（需要登录）
- `/devices/:id` - 设备详情（需要登录）
- `/profile` - 个人信息（需要登录）

## License

MIT

