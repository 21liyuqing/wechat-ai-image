/**
 * Coze 图片生成服务
 * 通过云函数调用 Coze API，密钥不暴露于前端
 */
const { callCloudFunction } = require('../utils/request');
const { CLOUDFUNCTION_NAME } = require('../config/constants');

/**
 * 调用 Coze 生成图片
 * @param {object} params
 * @param {string} params.prompt - 提示词
 * @param {string} params.style - 图片类型：general | character | anime
 * @returns {Promise<{ imageUrl: string }>} 返回图片 URL
 */
function generateImage({ prompt, style }) {
  return callCloudFunction(CLOUDFUNCTION_NAME, {
    prompt,
    style: style || 'general',
  });
}

module.exports = {
  generateImage,
};
