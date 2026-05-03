export default (initialState: API.UserInfo) => {
  // 在这里按照初始化数据定义项目中的权限，统一管理
  // 参考文档 https://umijs.org/docs/max/access
  const { isLogin, currentUser } = initialState || {};

  return {
    // 定义 canAdmin 的具体逻辑
    // 只要登录了，就允许访问（或者判断 role === 'admin'）
    canAdmin: isLogin && currentUser?.role === 'admin',

    // 你也可以定义其他权限
    // canDelete: currentUser?.role === 'superAdmin',
  };
};
