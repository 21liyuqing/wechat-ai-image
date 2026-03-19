/**
 * 统一请求封装
 * 基于 wx.request，支持云函数调用
 */

/**
 * 调用云函数
 * @param {string} name - 云函数名称
 * @param {object} data - 传入参数
 * @returns {Promise<object>} 返回结果
 */
function callCloudFunction(name, data = {}) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        const result = res.result;
        // 支持云函数直接返回数据，或 { errCode: 0, data } 格式
        if (result && (result.errCode === undefined || result.errCode === 0)) {
          resolve(result.data || result);
        } else if (result && result.errCode !== 0) {
          const errMsg = result.errMsg || result.message || '请求失败';
          reject(new Error(errMsg));
        } else {
          resolve(result || {});
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
}

/**
 * 通用 HTTP 请求（若需直连 API 时使用）
 * @param {object} options - wx.request 配置
 * @returns {Promise<object>}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || `请求失败: ${res.statusCode}`));
        }
      },
      fail: reject,
    });
  });
}

module.exports = {
  callCloudFunction,
  request,
};
