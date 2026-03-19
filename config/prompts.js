/**
 * 预设提示词案例池
 * 每次展示 4 条，点击「换一批」随机抽取
 */
const PROMPTS = [
  { id: 1, text: '一只可爱的橘猫在阳光下打盹，毛茸茸的尾巴微微摆动', type: 'general' },
  { id: 2, text: '赛博朋克风格的城市夜景，霓虹灯闪烁，雨夜街道', type: 'general' },
  { id: 3, text: '一位穿着汉服的少女在樱花树下微笑，古风唯美', type: 'character' },
  { id: 4, text: '未来科技感的宇航员漫步在火星红色沙漠上', type: 'character' },
  { id: 5, text: '日式动漫风格，校园少女在教室窗边眺望远方', type: 'anime' },
  { id: 6, text: '二次元风格的魔法少女，手持法杖，魔法特效环绕', type: 'anime' },
  { id: 7, text: '夏日海边落日，金色沙滩与粉色天空', type: 'general' },
  { id: 8, text: '森林中的小木屋，烟囱冒炊烟，周围开满野花', type: 'general' },
  { id: 9, text: '一位戴墨镜的都市青年，站在摩天大楼天台', type: 'character' },
  { id: 10, text: '中世纪骑士骑着白马穿过迷雾森林', type: 'character' },
  { id: 11, text: '治愈系动漫，小动物们在草地上野餐', type: 'anime' },
  { id: 12, text: '蒸汽朋克风格的机械城，齿轮与飞艇', type: 'anime' },
];

/** 每次展示条数 */
const DISPLAY_COUNT = 4;

module.exports = {
  PROMPTS,
  DISPLAY_COUNT,
};
