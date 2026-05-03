import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, request } from '@umijs/max';
import { message } from 'antd';

export default () => {
  const handleSubmit = async (values: any) => {
    try {
      const res = await request('/api/login', { method: 'POST', data: values });
      if (res.token) {
        localStorage.setItem('token', res.token); // 存储令牌
        message.success('登录成功');
        history.push('/orders'); // 跳转到列表页
      }
    } catch (error) {
      message.error('登录失败，请检查账号密码');
    }
  };

  return (
    <div
      style={{ backgroundColor: '#eee', height: '100vh', padding: '100px 0' }}
    >
      <LoginForm title="闲来小院" subTitle="管理后台" onFinish={handleSubmit}>
        <ProFormText
          name="username"
          fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
          placeholder="用户名: admin"
          rules={[{ required: true }]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
          placeholder="密码"
          rules={[{ required: true }]}
        />
      </LoginForm>
    </div>
  );
};
