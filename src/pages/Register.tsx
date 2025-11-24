import { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuthStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 如果已登录，自动跳转
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/devices', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 粒子系统（与登录页相同）
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

    const animate = () => {
      ctx.fillStyle = 'rgba(8, 12, 28, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

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

  const onFinish = async (values: {
    telephone: string;
    username: string;
    email?: string;
    password: string;
    confirmPassword: string;
  }) => {
    if (values.password !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }

    setLoading(true);
    try {
      await register({
        telephone: values.telephone,
        username: values.username,
        email: values.email,
        password: values.password,
      });
      message.success('注册成功，已自动登录');
      navigate('/devices');
    } catch (error: any) {
      message.error(error.message || '注册失败，请稍后重试');
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
        padding: '20px',
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

      {/* 注册卡片 */}
      <div
        style={{
          width: '100%',
          maxWidth: 480,
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
          }}
        >
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
            }}
          >
            注册账号
          </div>
          
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
            CREATE ACCOUNT
          </div>
        </div>

        {/* 注册表单 */}
        <Form
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="telephone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
            style={{ marginBottom: 24 }}
          >
            <Input
              prefix={<PhoneOutlined style={{ color: 'rgba(0, 225, 255, 0.8)', fontSize: 16 }} />}
              placeholder="手机号"
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
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { pattern: /^[a-zA-Z0-9_]{4,20}$/, message: '用户名4-20个字符，只能包含字母、数字和下划线' },
            ]}
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
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[{ type: 'email', message: '请输入正确的邮箱地址' }]}
            style={{ marginBottom: 24 }}
          >
            <Input
              prefix={<MailOutlined style={{ color: 'rgba(0, 225, 255, 0.8)', fontSize: 16 }} />}
              placeholder="邮箱（可选）"
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
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码长度至少6位' },
            ]}
            style={{ marginBottom: 24 }}
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
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
            style={{ marginBottom: 32 }}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'rgba(0, 225, 255, 0.8)', fontSize: 16 }} />}
              placeholder="确认密码"
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
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.8)';
                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                e.target.style.boxShadow = '0 0 0 4px rgba(0, 225, 255, 0.15), 0 0 20px rgba(0, 225, 255, 0.3)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(0, 225, 255, 0.2)';
                e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                e.target.style.boxShadow = 'none';
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 225, 255, 1) 0%, rgba(147, 51, 234, 1) 100%)';
                e.currentTarget.style.boxShadow = `
                  0 8px 30px rgba(0, 225, 255, 0.5),
                  0 0 40px rgba(0, 225, 255, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.3)
                `;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 225, 255, 0.8) 0%, rgba(147, 51, 234, 0.8) 100%)';
                e.currentTarget.style.boxShadow = `
                  0 6px 20px rgba(0, 225, 255, 0.4),
                  0 0 30px rgba(0, 225, 255, 0.2),
                  inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              注册
            </Button>
          </Form.Item>
        </Form>

        {/* 登录链接 */}
        <div
          style={{
            textAlign: 'center',
            marginTop: 32,
            paddingTop: 24,
            borderTop: '1px solid rgba(0, 225, 255, 0.1)',
          }}
        >
          <Link
            to="/login"
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
            已有账号？立即登录
          </Link>
        </div>
      </div>

      <style>{`
        input::placeholder,
        .ant-input-password input::placeholder {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        
        input,
        .ant-input-password input {
          color: #ffffff !important;
        }
        
        .ant-input-password-icon {
          color: rgba(0, 225, 255, 0.8) !important;
        }
      `}</style>
    </div>
  );
}
