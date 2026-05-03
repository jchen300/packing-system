// 运行时配置
import { RequestConfig, history } from '@umijs/max';
// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState() {
  const token = localStorage.getItem('token');

  // 如果没有 token，直接返回空状态
  if (!token) {
    return { isLogin: false };
  }

  // 如果有 token，我们可以假设它是管理员（或者解码 token 获取信息）
  // 也可以在这里调用一个 /api/currentUser 接口来验证 token 有效性
  return {
    isLogin: true,
    currentUser: { name: 'Admin', role: 'admin' },
  };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};

export const request: RequestConfig = {
  timeout: 10000,
  // 修正後的攔截器寫法
  requestInterceptors: [
    (config: any) => {
      // 在 Umi 的最新版本中，config 包含了 url 和 options
      const token = localStorage.getItem('token');

      // 確保 headers 存在
      const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

      return {
        ...config,
        headers: {
          ...config.headers,
          ...authHeader,
        },
      };
    },
  ],

  responseInterceptors: [
    [
      (response) => response,
      (error: any) => {
        // 當後端返回 401 時跳轉登錄
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          history.push('/login');
        }
        return Promise.reject(error);
      },
    ],
  ],
};
