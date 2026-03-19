/**
 * 常量配置
 * API 地址、图片类型定义等
 */

// 云函数名称（调用云函数代理 Coze API，密钥不暴露于前端）
const CLOUDFUNCTION_NAME = 'generateImageV2';

// 图片类型与 Coze 参数映射
const IMAGE_TYPES = [
  { id: 'general', label: '通用', value: 'general', desc: '适配多种场景' },
  { id: 'character', label: '人物', value: 'character', desc: '侧重人物、肖像类' },
  { id: 'anime', label: '动漫', value: 'anime', desc: '动漫、二次元风格' },
];

// 默认选中类型
const DEFAULT_IMAGE_TYPE = 'general';

// 提示词最大长度限制
const PROMPT_MAX_LENGTH = 500;

// 提示词最小长度
const PROMPT_MIN_LENGTH = 1;

module.exports = {
  CLOUDFUNCTION_NAME,
  IMAGE_TYPES,
  DEFAULT_IMAGE_TYPE,
  PROMPT_MAX_LENGTH,
  PROMPT_MIN_LENGTH,
};
