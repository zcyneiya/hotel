import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { authService } from '../services/api';
import { useAuthStore } from '../store/authStore';
import logoImg from '../assets/img/easystay_logo.png';
import backgroundImg from '../assets/img/login_background.png';

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let animationId;
    let particles = [];
    const particleCount = 35;
    const maxDistance = 120;
    const maxDistanceSq = maxDistance * maxDistance;
    let mouse = { x: null, y: null };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 初始化粒子
    particles = Array.from({ length: particleCount }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: 2,
      dx: (Math.random() - 0.5) * 0.6,
      dy: (Math.random() - 0.5) * 0.6
    }));

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.dx;
        p.y += p.dy;

        // 边界反弹
        if (p.x < 0 || p.x > window.innerWidth) p.dx *= -1;
        if (p.y < 0 || p.y > window.innerHeight) p.dy *= -1;

        // 鼠标吸附
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 150 * 150) {
            p.x -= dx * 0.002;
            p.y -= dy * 0.002;
          }
        }

        // 画粒子
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        // 连线
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistanceSq) {
            const opacity = 1 - distSq / maxDistanceSq;

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255,255,255,${opacity})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const onLoginFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authService.login(values);
      const { token, user } = res.data;
      setAuth(user, token);
      message.success('登录成功');

      // 根据角色跳转
      if (user.role === 'merchant') {
        navigate('/merchant');
      } else if (user.role === 'admin') {
        navigate('/admin');
      }
    } catch (error) {
      message.error(error.response?.data?.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      await authService.register(values);
      message.success('注册成功，请登录');
      setMode('login');
    } catch (error) {
      message.error(error.response?.data?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(-45deg, #1e3c72, #2a5298, #3b82f6, #1e40af)',
        backgroundSize: '400% 400%',
        animation: 'gradientMove 15s ease infinite'
      }}
    >
      <header style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: '#1b1b1b',
        fontSize: 24,
        fontWeight: 'bold'
      }}>
        <img src={logoImg} alt="Logo" style={{
          width: 120,
          marginRight: 10,
          verticalAlign: 'middle'  // 图片垂直居中
        }} />
        <h2 style={{
          display: 'inline-block',
          margin: 0,
          verticalAlign: 'middle',  // 文字垂直居中
          lineHeight: '1'  // 调整行高
        }}>易宿酒店管理平台</h2>
      </header>

      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0
        }}
      />
      <AuthCard
        mode={mode}
        setMode={setMode}
        onLoginFinish={onLoginFinish}
        onRegisterFinish={onRegisterFinish}
        loading={loading}
      />
    </div>
  );
}

const AuthCard = ({
  mode,
  setMode,
  onLoginFinish,
  onRegisterFinish,
  loading
}) => {

  const isLogin = mode === 'login';

  return (
    <Card
      style={{
        width: 800,
        padding: 0,
        overflow: 'hidden',
        borderRadius: 12,
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div style={{ display: 'flex', minHeight: 450 }}>
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <img
            src={backgroundImg}
            alt="Background"
            style={{
              width: '100%',
              maxWidth: 300,
              objectFit: 'contain'
            }}
          />
        </div>

        <div style={{
          flex: 1,
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>

          <h2 style={{
            marginBottom: 30,
            textAlign: 'center',
            color: '#333'
          }}>
            {isLogin ? '欢迎登录' : '用户注册'}
          </h2>

          <Form
            onFinish={isLogin ? onLoginFinish : onRegisterFinish}
            autoComplete="off"
            layout="vertical"
          >

            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>

            {!isLogin && (
              <>
                <Form.Item
                  name="role"
                  rules={[{ required: true, message: '请选择角色' }]}
                >
                  <Radio.Group>
                    <Radio value="merchant">商户</Radio>
                    <Radio value="admin">管理员</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item name="email">
                  <Input prefix={<MailOutlined />} placeholder="邮箱（可选）" />
                </Form.Item>

                <Form.Item name="phone">
                  <Input prefix={<PhoneOutlined />} placeholder="手机号（可选）" />
                </Form.Item>
              </>
            )}

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                {isLogin ? '登录' : '注册'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              {isLogin ? (
                <>
                  还没有账号？
                  <span
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => setMode('register')}
                  >
                    立即注册
                  </span>
                </>
              ) : (
                <>
                  已有账号？
                  <span
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                    onClick={() => setMode('login')}
                  >
                    立即登录
                  </span>
                </>
              )}
            </div>

          </Form>
        </div>
      </div>
    </Card>
  );
};


export default Login;
