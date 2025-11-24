import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 如果已登录，自动跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/devices', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 粒子系统
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }> = [];

    // 创建粒子
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    // 连接线
    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(0, 225, 255, ${0.15 * (1 - distance / 150)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // 动画循环
    const animate = () => {
      ctx.fillStyle = 'rgba(8, 12, 28, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // 绘制粒子
        ctx.fillStyle = `rgba(0, 225, 255, ${particle.opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      drawLines();
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.username, values.password);
      message.success('登录成功');
      navigate('/devices');
    } catch (error: any) {
      message.error(error.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 25%, #0f1419 50%, #1a1f3a 75%, #0a0e27 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 粒子画布 */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      />

      {/* 动态光束效果 */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '-10%',
          width: '400px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(0, 225, 255, 0.8), transparent)',
          transform: 'rotate(45deg)',
          animation: 'beam-sweep 8s linear infinite',
          boxShadow: '0 0 20px rgba(0, 225, 255, 0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '-10%',
          width: '400px',
          height: '2px',
          background: 'linear-gradient(90deg, transparent, rgba(147, 51, 234, 0.8), transparent)',
          transform: 'rotate(-45deg)',
          animation: 'beam-sweep 10s linear infinite reverse',
          boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)',
        }}
      />

      {/* 全息光晕效果 */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(0, 225, 255, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'hologram-pulse 6s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          animation: 'hologram-pulse 8s ease-in-out infinite',
        }}
      />

      {/* 网格背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(0, 225, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 225, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          opacity: 0.3,
          zIndex: 2,
        }}
      />

      {/* 数字雨效果背景 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 225, 255, 0.03) 2px,
              rgba(0, 225, 255, 0.03) 4px
            )
          `,
          opacity: 0.4,
          zIndex: 2,
          animation: 'data-stream 20s linear infinite',
        }}
      />

      {/* 功能标签 - 浮动展示 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        {/* 标签列表 */}
        {[
          { text: '低时延', delay: 0, top: '15%', left: '20%', moveX: 30, moveY: 25, rotate: 3 },
          { text: '高清', delay: 0.6, top: '15%', left: '45%', moveX: -35, moveY: 30, rotate: -4 },
          { text: '流畅', delay: 1.2, top: '15%', right: '20%', moveX: 40, moveY: -20, rotate: 2 },
          { text: '云主机', delay: 1.8, bottom: '30%', right: '20%', moveX: -30, moveY: -25, rotate: -3 },
          { text: '云服务', delay: 2.4, bottom: '30%', left: '20%', moveX: 35, moveY: -30, rotate: 4 },
          { text: 'GPU算力', delay: 3.0, top: '15%', left: '35%', moveX: -40, moveY: 20, rotate: -2 },
          { text: '云渲染', delay: 3.6, bottom: '50%', left: '18%', moveX: 45, moveY: -15, rotate: 2 },
          { text: '云电脑', delay: 4.2, bottom: '50%', right: '18%', moveX: -45, moveY: -35, rotate: -3 },
        ].map((tag, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: tag.top,
              bottom: tag.bottom,
              left: tag.left,
              right: tag.right,
              padding: '14px 28px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(0, 225, 255, 0.15) 0%, rgba(147, 51, 234, 0.15) 100%)',
              border: '2px solid rgba(0, 225, 255, 0.4)',
              backdropFilter: 'blur(15px) saturate(180%)',
              WebkitBackdropFilter: 'blur(15px) saturate(180%)',
              color: '#00e1ff',
              fontSize: 17,
              fontWeight: 600,
              letterSpacing: '0.06em',
              boxShadow: `
                0 8px 24px rgba(0, 225, 255, 0.3),
                0 0 40px rgba(0, 225, 255, 0.2),
                inset 0 1px 0 rgba(255, 255, 255, 0.15)
              `,
              animation: `tag-float-${index} 6s ease-in-out infinite ${tag.delay}s, tag-glow-strong 4s ease-in-out infinite ${tag.delay + 0.5}s`,
              opacity: 0.9,
              transform: 'translateY(0) translateX(0) rotate(0deg)',
              whiteSpace: 'nowrap',
              textShadow: '0 0 12px rgba(0, 225, 255, 0.7), 0 0 24px rgba(0, 225, 255, 0.4)',
              willChange: 'transform',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                animation: `tag-text-pulse 3s ease-in-out infinite ${tag.delay + 1}s`,
                position: 'relative',
                zIndex: 1,
              }}
            >
              {tag.text}
            </span>
            {/* 左侧光点装饰 */}
            <span
              style={{
                position: 'absolute',
                top: '50%',
                left: '12px',
                transform: 'translateY(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #00e1ff, #9333ea)',
                boxShadow: `
                  0 0 12px rgba(0, 225, 255, 1),
                  0 0 24px rgba(0, 225, 255, 0.6),
                  0 0 36px rgba(147, 51, 234, 0.4)
                `,
                animation: `tag-dot-pulse-strong 2.5s ease-in-out infinite ${tag.delay}s`,
              }}
            />
            {/* 右侧光点装饰 */}
            <span
              style={{
                position: 'absolute',
                top: '50%',
                right: '12px',
                transform: 'translateY(-50%)',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #9333ea, #00e1ff)',
                boxShadow: `
                  0 0 12px rgba(147, 51, 234, 1),
                  0 0 24px rgba(147, 51, 234, 0.6),
                  0 0 36px rgba(0, 225, 255, 0.4)
                `,
                animation: `tag-dot-pulse-strong 2.5s ease-in-out infinite ${tag.delay + 0.7}s`,
              }}
            />
          </div>
        ))}
      </div>

      {/* 登录卡片 */}
      <div
        style={{
          width: 480,
          borderRadius: 24,
          background: 'rgba(10, 14, 39, 0.85)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(0, 225, 255, 0.2)',
          boxShadow: `
            0 24px 80px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(0, 225, 255, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.1),
            0 0 60px rgba(0, 225, 255, 0.1)
          `,
          padding: '56px 48px',
          position: 'relative',
          zIndex: 10,
          animation: 'apple-fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
        }}
      >
        {/* 卡片内部光效 */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 225, 255, 0.6), transparent)',
            animation: 'glow-sweep 3s ease-in-out infinite',
          }}
        />

        {/* Logo 区域 */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: 48,
            position: 'relative',
          }}
        >
          {/* Logo 光效 */}
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: 'linear-gradient(135deg, rgba(0, 225, 255, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              position: 'relative',
              boxShadow: `
                0 0 30px rgba(0, 225, 255, 0.4),
                inset 0 0 20px rgba(0, 225, 255, 0.1),
                0 0 60px rgba(147, 51, 234, 0.3)
              `,
              animation: 'logo-glow 3s ease-in-out infinite',
            }}
          >
            <span style={{ filter: 'drop-shadow(0 0 10px rgba(0, 225, 255, 0.8))' }}>☁️</span>
          </div>
          
          {/* 系统名称 */}
          <div
            style={{
              fontSize: 38,
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00e1ff 0%, #9333ea 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              letterSpacing: '-0.03em',
              marginBottom: 12,
              lineHeight: 1.2,
              textShadow: '0 0 30px rgba(0, 225, 255, 0.5)',
            }}
          >
            云电脑用户端
          </div>
          
          {/* 副标题 */}
          <div
            style={{
              fontSize: 15,
              color: 'rgba(255, 255, 255, 0.6)',
              fontWeight: 400,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              fontFamily: 'monospace',
            }}
          >
            CLOUD COMPUTER CLIENT
          </div>
          
          {/* 装饰线条 */}
          <div
            style={{
              width: 60,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 225, 255, 0.8), transparent)',
              margin: '16px auto 0',
              boxShadow: '0 0 10px rgba(0, 225, 255, 0.6)',
            }}
          />
        </div>

        {/* 登录表单 */}
        <Form
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
            style={{ marginBottom: 24 }}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'rgba(0, 225, 255, 0.8)', fontSize: 16 }} />}
              placeholder="用户名"
              size="large"
              style={{
                height: 56,
                borderRadius: 12,
                border: '1.5px solid rgba(0, 225, 255, 0.2)',
                fontSize: 16,
                paddingLeft: 48,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                const input = e.target;
                input.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                input.style.background = 'rgba(255, 255, 255, 0.08)';
                input.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                const input = e.target;
                input.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                input.style.background = 'rgba(255, 255, 255, 0.05)';
                input.style.boxShadow = 'none';
              }}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0, 225, 255, 0.8)', fontSize: 16 }} />}
              placeholder="密码"
              size="large"
              style={{
                height: 56,
                borderRadius: 12,
                border: '1.5px solid rgba(0, 225, 255, 0.2)',
                fontSize: 16,
                paddingLeft: 48,
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onFocus={(e) => {
                const input = e.target;
                input.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                input.style.background = 'rgba(255, 255, 255, 0.08)';
                input.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                const input = e.target;
                input.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                input.style.background = 'rgba(255, 255, 255, 0.05)';
                input.style.boxShadow = 'none';
              }}
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              size="large"
              style={{
                height: 56,
                borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(0, 225, 255, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)',
                border: '1px solid rgba(0, 225, 255, 0.4)',
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: '0.05em',
                color: '#ffffff',
                textTransform: 'uppercase',
                boxShadow: `
                  0 6px 20px rgba(0, 225, 255, 0.4),
                  0 0 30px rgba(0, 225, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 225, 255, 1) 0%, rgba(147, 51, 234, 1) 100%)';
                e.currentTarget.style.boxShadow = `
                  0 8px 30px rgba(0, 225, 255, 0.5),
                  0 0 40px rgba(0, 225, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(0, 225, 255, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 225, 255, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)';
                e.currentTarget.style.boxShadow = `
                  0 6px 20px rgba(0, 225, 255, 0.4),
                  0 0 30px rgba(0, 225, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(0, 225, 255, 0.4)';
              }}
            >
              <span style={{ position: 'relative', zIndex: 1 }}>登录系统</span>
            </Button>
          </Form.Item>
        </Form>

        {/* 注册链接 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid rgba(0, 225, 255, 0.1)',
          }}
        >
          <Link
            to="/register"
            style={{
              color: 'rgba(0, 225, 255, 0.8)',
              textDecoration: 'none',
              fontSize: 14,
              transition: 'all 0.3s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#00e1ff';
              e.currentTarget.style.textShadow = '0 0 10px rgba(0, 225, 255, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(0, 225, 255, 0.8)';
              e.currentTarget.style.textShadow = 'none';
            }}
          >
            还没有账号？立即注册
          </Link>
        </div>
      </div>

      <style>{`
        /* 输入框 placeholder 样式 */
        input::placeholder,
        .ant-input-password input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        
        /* 输入框文本颜色 */
        input,
        .ant-input-password input {
          color: #ffffff !important;
        }
        
        /* 密码可见性图标颜色 */
        .ant-input-password-icon {
          color: rgba(0, 225, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
