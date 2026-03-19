/**
 * 图片结果展示组件
 * 展示生成图片、保存至相册、重新生成按钮
 */
Component({
  properties: {
    imageUrl: { type: String, value: '' },
    error: { type: String, value: '' },
  },

  methods: {
    onSave() {
      this.triggerEvent('save');
    },
    onRegenerate() {
      this.triggerEvent('regenerate');
    },
    onImageError() {
      this.triggerEvent('error');
    },
  },
});
