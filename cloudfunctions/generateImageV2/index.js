/**
 * 云函数 generateImageV2
 * 调用 Coze 工作流 API 生成图片
 * 环境变量：TOKEN、WORKFLOW_ID（在云函数控制台配置）
 */
const COZE_BASE = 'https://api.coze.cn/v1';
const RUN_URL = `${COZE_BASE}/workflow/run`;
const COZE_HISTORY_URL = 'https://api.coze.cn/v1/workflow/get_run_history';

/** 轮询间隔（ms），图片生成通常需 10-30 秒 */
const POLL_INTERVAL = 2000;
const POLL_MAX_ATTEMPTS = 30;

// 图片类型映射：前端 general/character/anime -> Coze 工作流参数（中文）
const STYLE_MAP = {
  general: '通用',
  character: '人像',
  anime: '动漫',
};

/** 轮询获取异步工作流结果，最多等待约 60 秒 */
async function pollRunHistory(token, workflowId, executeId) {
  const maxAttempts = 30;
  const intervalMs = 2000;
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${COZE_HISTORY_URL}?workflow_id=${encodeURIComponent(workflowId)}&execute_id=${encodeURIComponent(executeId)}`,
      {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (data.code !== 0) {
      throw new Error(data.msg || '查询执行状态失败');
    }
    const item = data.data;
    const status = item?.execute_status || item?.status;
    if (status === 'Success' || status === 'SUCCESS') {
      return item.output;
    }
    if (status === 'Fail' || status === 'FAIL') {
      throw new Error(item?.error_message || item?.errorMessage || '工作流执行失败');
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('工作流执行超时');
}

/** 递归从对象中提取第一个 HTTP(S) URL（用于图片） */
function extractImageUrlDeep(obj, depth = 0) {
  if (depth > 10) return null;
  if (obj === null || obj === undefined) return null;
  if (typeof obj === 'string' && /^https?:\/\//.test(obj)) return obj;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const u = extractImageUrlDeep(item, depth + 1);
      if (u) return u;
    }
    return null;
  }
  if (typeof obj === 'object') {
    for (const v of Object.values(obj)) {
      const u = extractImageUrlDeep(v, depth + 1);
      if (u) return u;
    }
  }
  return null;
}

/**
 * 云函数入口
 * @param {object} event - 调用参数 { prompt, style }
 * @param {object} context - 运行上下文
 */
exports.main = async (event, context) => {
  const token = process.env.TOKEN;
  const workflowId = process.env.WORKFLOW_ID;

  if (!token || !workflowId) {
    return {
      errCode: -1,
      errMsg: '云函数环境变量未配置：请在控制台配置 TOKEN 和 WORKFLOW_ID',
    };
  }

  const prompt = (event.prompt || '').trim();
  if (!prompt) {
    return {
      errCode: -2,
      errMsg: '提示词不能为空',
    };
  }

  const style = event.style || 'general';
  const styleValue = STYLE_MAP[style] || STYLE_MAP.general;

  const body = {
    workflow_id: workflowId,
    parameters: {
      inputPrompt: prompt,
      style: styleValue,
    },
  };

  try {
    const res = await fetch(RUN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await res.json();

    if (result.code !== 0) {
      return {
        errCode: result.code || -3,
        errMsg: result.msg || 'Coze API 调用失败',
      };
    }

    // Coze 返回的 data 为 JSON 字符串，需解析
    let parsed = null;
    try {
      const rawData = result.data;
      if (typeof rawData === 'string') {
        if (/^https?:\/\//.test(rawData.trim())) {
          // data 本身可能是直接的 URL 字符串
          return { errCode: 0, data: { imageUrl: rawData.trim() } };
        }
        parsed = JSON.parse(rawData);
      } else if (rawData && typeof rawData === 'object') {
        parsed = rawData;
      } else {
        parsed = {};
      }
    } catch (e) {
      parsed = result.data && typeof result.data === 'object' ? result.data : {};
    }

    // 优先按已知字段名提取
    const knownPaths = [
      ['imageUrl'], ['url'], ['image_url'], ['image', 'url'], ['output', 'imageUrl'],
      ['output', 'url'], ['data', 'imageUrl'], ['data', 'url'], ['result', 'url'],
      ['images', '0', 'url'], ['images', '0', 'urls', '0'], ['output', 'images', '0', 'url'],
    ];
    let imageUrl = null;
    for (const path of knownPaths) {
      let v = parsed;
      for (const k of path) {
        v = v?.[k];
        if (v === undefined) break;
      }
      if (typeof v === 'string' && /^https?:\/\//.test(v)) {
        imageUrl = v;
        break;
      }
    }

    // 若未找到，递归搜索任意 HTTP(S) URL
    if (!imageUrl) {
      imageUrl = extractImageUrlDeep(parsed);
    }

    if (!imageUrl) {
      return {
        errCode: -4,
        errMsg: '未从工作流返回中解析到图片地址，请检查工作流输出结构',
        debug: JSON.stringify(parsed).slice(0, 500),
      };
    }

    return {
      errCode: 0,
      data: { imageUrl },
    };
  } catch (err) {
    console.error('generateImageV2 error:', err);
    return {
      errCode: -5,
      errMsg: err.message || '网络请求异常，请稍后重试',
    };
  }
};
