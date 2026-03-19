/**
 * 首页 / 生成页
 * 承载输入、类型选择、案例选择、生成、结果展示、保存、重新生成
 */
const { generateImage } = require('../../service/coze');
const { IMAGE_TYPES, DEFAULT_IMAGE_TYPE, PROMPT_MAX_LENGTH, PROMPT_MIN_LENGTH } = require('../../config/constants');
const { PROMPTS, DISPLAY_COUNT } = require('../../config/prompts');

/** 从数组中随机抽取 n 个不重复项 */
function pickRandom(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

Page({
  data: {
    prompt: '',
    imageType: DEFAULT_IMAGE_TYPE,
    imageTypes: IMAGE_TYPES,
    displayedPrompts: [], // 当前展示的 4 条提示词
    loading: false,
    imageUrl: '',
    error: '',
  },

  onLoad() {
    this._refreshPrompts();
  },

  // 换一批提示词
  onRefreshPrompts() {
    this._refreshPrompts();
  },

  _refreshPrompts() {
    const displayedPrompts = pickRandom(PROMPTS, DISPLAY_COUNT);
    this.setData({ displayedPrompts });
  },

  // 输入提示词
  onPromptInput(e) {
    const value = (e.detail.value || '').trim();
    this.setData({
      prompt: value,
      error: '',
    });
  },

  // 选择图片类型
  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    if (type) {
      this.setData({ imageType: type, error: '' });
    }
  },

  // 选择预设案例（仅填充文本，不更换类型）
  onPromptSelect(e) {
    const text = e.currentTarget.dataset.text;
    if (text) {
      this.setData({
        prompt: text,
        error: '',
      });
    }
  },

  // 校验提示词
  _validatePrompt() {
    const { prompt } = this.data;
    if (!prompt || prompt.length < PROMPT_MIN_LENGTH) {
      wx.showToast({ title: '请输入提示词', icon: 'none' });
      return false;
    }
    if (prompt.length > PROMPT_MAX_LENGTH) {
      wx.showToast({ title: `提示词不能超过${PROMPT_MAX_LENGTH}字`, icon: 'none' });
      return false;
    }
    return true;
  },

  // 发起生成
  async onGenerate() {
    if (this.data.loading) return;
    if (!this._validatePrompt()) return;

    this.setData({ loading: true, error: '' });

    try {
      const res = await generateImage({
        prompt: this.data.prompt,
        style: this.data.imageType,
      });

      const imageUrl = res?.imageUrl || res?.url || res?.data?.imageUrl;
      if (!imageUrl) {
        throw new Error('未获取到图片地址');
      }

      this.setData({
        imageUrl,
        loading: false,
      });
    } catch (err) {
      const msg = err.errMsg || err.message || '生成失败，请稍后重试';
      this.setData({
        loading: false,
        error: msg,
      });
      wx.showToast({ title: msg, icon: 'none', duration: 2500 });
    }
  },

  // 保存到相册
  async onSaveToAlbum() {
    const { imageUrl } = this.data;
    if (!imageUrl) return;

    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => this._doSaveImage(imageUrl),
            fail: () => {
              wx.showModal({
                title: '需要相册权限',
                content: '保存图片需要您授权相册写入权限',
                confirmText: '去设置',
                success: (m) => {
                  if (m.confirm) wx.openSetting();
                },
              });
            },
          });
        } else {
          this._doSaveImage(imageUrl);
        }
      },
    });
  },

  _doSaveImage(imageUrl) {
    wx.showLoading({ title: '保存中...' });
    wx.downloadFile({
      url: imageUrl,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success: () => {
              wx.hideLoading();
              wx.showToast({ title: '已保存到相册', icon: 'success' });
            },
            fail: (err) => {
              wx.hideLoading();
              wx.showToast({ title: err.errMsg || '保存失败', icon: 'none' });
            },
          });
        } else {
          wx.hideLoading();
          wx.showToast({ title: '下载失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败', icon: 'none' });
      },
    });
  },

  // 重新生成
  onRegenerate() {
    this.onGenerate();
  },
});
