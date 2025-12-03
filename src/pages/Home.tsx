import { Button, Tag } from 'antd';
import {
  ArrowRightOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  CloudOutlined,
  CustomerServiceOutlined,
  CloudDownloadOutlined,
  AppstoreOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const planTable = [
  {
    name: 'E5-2680 v4',
    cpu: '14 核 28 线程',
    memory: '32 ～ 64 GB',
    gpu: 'GTX 1050 Ti',
    storage: '256 GB ～ 1 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥189 /月',
    best: false,
  },
  {
    name: 'E5-2686 v4 ×2',
    cpu: '36 核 72 线程',
    memory: '32 ～ 96 GB',
    gpu: 'GTX 1060',
    storage: '256 GB ～ 1 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥269 /月',
    best: true,
  },
  {
    name: 'E5-2696 v4 ×2',
    cpu: '44 核 88 线程',
    memory: '64 ～ 128 GB',
    gpu: 'GTX 3060',
    storage: '960 GB ～ 2 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥369 /月',
    best: false,
  },
  {
    name: '金牌 6138 ×2',
    cpu: '40 核 80 线程',
    memory: '64 ～ 96 GB',
    gpu: 'Tesla P4',
    storage: '800 GB ～ 2 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥469 /月',
    best: false,
  },
  {
    name: '铂金 8259CL ×2',
    cpu: '48 核 96 线程',
    memory: '96 ～ 128 GB',
    gpu: 'Tesla P4',
    storage: '800 GB ～ 2 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥569 /月',
    best: false,
  },
  {
    name: '金牌 6230R ×2',
    cpu: '52 核 104 线程',
    memory: '192 ～ 256 GB',
    gpu: 'Tesla P100',
    storage: '1 ～ 3 TB',
    extras: ['屏幕墙', '高清画质', '首单 15 分钟无理由'],
    price: '¥699 /月',
    best: false,
  },
];

const productHighlights = [
  { title: '云服务器', desc: '高性能云主机，弹性扩缩容，适配主流业务场景。' },
  { title: '裸金属服务器', desc: '接近物理机的算力释放，专属资源独享。' },
  { title: '轻量应用服务器', desc: '一键部署，面向中小业务的便捷选项。' },
  { title: 'GPU 服务器', desc: '面向渲染、AI、仿真的算力集群。' },
  { title: '高防服务器', desc: '全链路防护，抵御各类 DDoS 攻击。' },
  { title: '云电脑', desc: '统一云端办公环境，安全、高效、可监管。' },
];

const featureList = [
  {
    icon: <ThunderboltOutlined />,
    title: '易用快捷',
    desc: '无需自建机房，分钟级交付，统一控制台即可完成云电脑交付与回收。',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '安全合规',
    desc: '数据全程留在云端，访问协议加密，结合多因素认证构建零信任工作空间。',
  },
  {
    icon: <CloudOutlined />,
    title: '弹性灵活',
    desc: '按需创建、随用随停，多端入口覆盖 Windows / macOS / Web / iOS / Android。',
  },
];

const supportCategories = [
  {
    icon: <CloudDownloadOutlined />,
    title: '官方客户端',
    featured: 'Cloud Computer Client',
    desc: 'Windows / macOS / Web / iOS / Android 全端覆盖，GPU 云桌面最高 60fps，统一登录控制台即可下载。',
    items: [
      'GPU 云桌面 60fps，自动适配带宽',
      '一键接入企业账号体系，支持 SSO',
      '内置安全加固：剪贴板管控、文件传输策略',
    ],
  },
  {
    icon: <AppstoreOutlined />,
    title: '模拟器适配',
    featured: '雷电 · MuMu · 夜神',
    desc: '针对手游、教育、测试场景提供专业模拟器能力，支持 VT（二次虚拟化）与多开调度。',
    items: [
      '雷电模拟器：多开占用低、默认智能按键',
      'MuMu / 夜神：兼容 Android 4/5/7，多版本自由切换',
      '官方调优指南，保障高帧率与稳定性',
    ],
  },
  {
    icon: <ShareAltOutlined />,
    title: '远程控制',
    featured: 'ToDesk · TeamViewer · 向日葵',
    desc: '与云电脑无缝集成的远控生态，提供毫秒级延迟、跨区域安全接入，支撑售后与协作场景。',
    items: [
      'ToDesk：自建多节点网络，低延迟远控体验',
      'TeamViewer：全球化部署，适配多终端',
      '向日葵：内网穿透 + SaaS 管理，适合企业运维',
    ],
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <header className="landing-hero apple-fade-in">
        <nav className="landing-nav">
          <div className="logo" onClick={() => navigate('/')}>
            <span role="img" aria-label="cloud">☁️</span> Cloud Computer
          </div>
          <div className="nav-links">
            <button onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>产品套餐</button>
            <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}>产品矩阵</button>
            <button onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}>支持服务</button>
          </div>
          <div className="nav-cta">
            <Button type="text" onClick={() => navigate('/login')}>控制台登录</Button>
            <Button type="primary" onClick={() => navigate('/register')}>立即注册</Button>
          </div>
        </nav>

        <div className="hero-content">
          <div>
            <Tag color="blue" style={{ borderRadius: 999 }}>云电脑 · 快速交付</Tag>
            <h1>安全、易用、灵活的云上电脑服务</h1>
            <p>
              参考行业领先云电脑产品（如亿速云）打造的现代化云桌面体验，
              提供覆盖开发、设计、教育实训等场景的统一数字工作空间。
            </p>
            <div className="hero-actions">
              <Button type="primary" size="large" onClick={() => navigate('/register')} icon={<ArrowRightOutlined />}>
                立即开通
              </Button>
              <Button size="large" onClick={() => navigate('/login')}>进入控制台</Button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel__content">
              <p>精选配置</p>
              <h2>云电脑旗舰型</h2>
              <ul>
                <li>8 核 vCPU · 16 GB 内存</li>
                <li>50 Mbps 独享带宽</li>
                <li>NVMe 系统盘 80 GB</li>
                <li>GPU 云桌面最高 60 fps</li>
              </ul>
              <Button type="primary" ghost onClick={() => document.getElementById('plans')?.scrollIntoView({ behavior: 'smooth' })}>
                查看套餐 <ArrowRightOutlined />
              </Button>
            </div>
            <div className="hero-panel__gradient" />
          </div>
        </div>

        <div className="hero-stats">
          <div>
            <strong>50+</strong>
            <span>热门云产品矩阵</span>
          </div>
          <div>
            <strong>9x9</strong>
            <span>存储可靠性与数据安全</span>
          </div>
          <div>
            <strong>7×24h</strong>
            <span>专家级售后支撑</span>
          </div>
          <div>
            <strong>400-100-2938</strong>
            <span>售前咨询热线</span>
          </div>
        </div>
      </header>

      <section id="products" className="product-showcase">
        <h2>全栈算力产品</h2>
        <p>云服务器、高防、GPU、云电脑一站式覆盖，灵活应对业务增长。</p>
        <div className="product-grid">
          {productHighlights.map((item) => (
            <div key={item.title} className="product-card apple-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <Button type="link" onClick={() => navigate('/login')}>
                了解详情 <ArrowRightOutlined />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section id="plans" className="plan-section">
        <div className="section-header">
          <div>
            <h2>云电脑产品推荐</h2>
            <p>多规格套餐覆盖办公、教育、设计、渲染等高强度应用。</p>
          </div>
          <Button size="large" type="primary" onClick={() => navigate('/register')}>
            自定义配置 <ArrowRightOutlined />
          </Button>
        </div>
        <div className="plan-grid plan-grid--two-rows">
          {planTable.map((plan, index) => (
            <div
              key={plan.name}
              className={`plan-card ${plan.best ? 'plan-card--highlight plan-card--featured' : ''} ${
                index >= Math.ceil(planTable.length / 2) ? 'plan-card--second-row' : ''
              }`}
            >
              <div className="plan-card__header">
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.cpu}</p>
                </div>
                {plan.best && <Tag color="gold">热卖</Tag>}
              </div>
              <div className="plan-card__specs">
                <div>
                  <span>内存</span>
                  <strong>{plan.memory}</strong>
                </div>
                <div>
                  <span>GPU</span>
                  <strong>{plan.gpu}</strong>
                </div>
                <div>
                  <span>存储</span>
                  <strong>{plan.storage}</strong>
                </div>
              </div>
              <div className="plan-card__extras">
                {plan.extras.map((extra) => (
                  <Tag key={`${plan.name}-${extra}`} color="blue">
                    {extra}
                  </Tag>
                ))}
              </div>
              <div className="plan-card__footer">
                <div className="plan-price">{plan.price}</div>
                <Button type={plan.best ? 'primary' : 'default'} block onClick={() => navigate('/register')}>
                  立即开通
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="feature-section">
        <div className="feature-intro apple-card">
          <h2>产品优势</h2>
          <p>借鉴亿速云云电脑架构设计，打造易用、安全、灵活的桌面云，满足企业办公到行业应用的多元需求。</p>
          <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate('/login')}>
            进入控制台
          </Button>
        </div>
        <div className="feature-grid">
          {featureList.map((feature) => (
            <div key={feature.title} className="feature-card apple-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="support" className="support-section">
        <h2>支撑应用生态</h2>
        <p>官方客户端、主流模拟器与远程控制工具一体化适配，确保云桌面在办公、教育、游戏等场景的体验一致。</p>
        <div className="support-grid">
          {supportCategories.map((category) => (
            <div key={category.title} className="support-category apple-card">
              <div className="support-category__header">
                <div className="support-category__icon">{category.icon}</div>
                <div>
                  <h3>{category.title}</h3>
                  <span>{category.featured}</span>
                </div>
              </div>
              <p>{category.desc}</p>
              <ul>
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="support-cta">
          <div>
            <h3><CustomerServiceOutlined /> 7×24 专家服务</h3>
            <p>售前咨询：400-100-2938 · 在线工单 / 即时客服全程响应。</p>
          </div>
          <Button size="large" type="primary" onClick={() => navigate('/login')}>
            提交工单
          </Button>
        </div>
      </section>

      <section className="cta-final apple-card">
        <div>
          <h2>立即开通云电脑，开启安全高效的云上办公</h2>
          <p>一分钟注册账号，即可获得控制台访问与免费体验额度。</p>
        </div>
        <div className="cta-actions">
          <Button size="large" type="primary" onClick={() => navigate('/register')}>
            免费注册
          </Button>
          <Button size="large" onClick={() => navigate('/login')}>
            登录控制台
          </Button>
        </div>
      </section>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} Cloud Computer Server · 借鉴行业优秀实践打造云电脑体验。</p>
        <div className="footer-links">
          <button onClick={() => navigate('/login')}>控制台</button>
          <button onClick={() => navigate('/register')}>注册账号</button>
          <button onClick={() => document.getElementById('support')?.scrollIntoView({ behavior: 'smooth' })}>
            支持服务
          </button>
        </div>
      </footer>
    </div>
  );
}

