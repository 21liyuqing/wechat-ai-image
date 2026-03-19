// app.js - 小程序入口逻辑
App({
  onLaunch() {
    // 初始化云开发（云函数已配置）
    if (wx.cloud) {
      wx.cloud.init({ traceUser: true });
    }
    console.log('AI 图片生成小程序已启动');
  },
  onShow() {
    // 小程序显示时
  },
  onHide() {
    // 小程序隐藏时
  },
});
