import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '闲来小院打包管理', // 改為你的系統名稱
    locale: true,
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
      // pathRewrite: { '^/api': '' }, // <--- 注意这里！
    },
  },
  locale: {
    default: 'zh-CN', // 强制默认语言为简体中文
    antd: true, // 开启 Ant Design 的简体中文包
    baseNavigator: false, // 不跟随浏览器语言，强制使用默认设置
  },
  routes: [
    { path: '/', redirect: '/orders' },
    {
      name: '订单管理',
      icon: 'table',
      path: '/orders',
      component: './OrderList',
    },
    {
      name: '新增发货',
      icon: 'plus',
      path: '/orders/add',
      component: './OrderAdd',
    },
    { path: '/orders/edit/:id', component: './OrderEdit', hideInMenu: true },
  ],
  npmClient: 'npm',
  utoopack: {},
});
