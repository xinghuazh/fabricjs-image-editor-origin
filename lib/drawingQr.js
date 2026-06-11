/**
 * Define action to draw circle by mouse actions
 */
(function () {
  //---------------------------------------------------------------------------
  // 使用 free QR Code API (quickchart.io)
  function buildQRCodeURL(data, options = {}) {
    const {
      size = 200,                    // 二维码尺寸 (px)
      version = 0,                   // 版本, 1:21x21, 2:25x25
      margin = 0,                    // 边距 (模块数)
      errorCorrection = 'L',         // 纠错级别: L, M, Q, H
      foregroundColor = '#000000',   // 前景色 (深色模块)
      backgroundColor = '#ffffff'    // 背景色
    } = options;

    // 参数校验
    const validEC = ['L', 'M', 'Q', 'H'];
    const ec = validEC.includes(errorCorrection) ? errorCorrection : 'L';

    // 构建 API URL (quickchart.io 免费方案)
    const baseURL = 'https://quickchart.io/qr';
    const params = new URLSearchParams({
      text: data,
      size: size,
      margin: margin,
      ecLevel: ec,
      dark: foregroundColor.replace('#', ''),
      light: backgroundColor.replace('#', '')
    });

    return `${baseURL}?${params.toString()}`;
  }

  //---------------------------------------------------------------------------
  fabric.QRCode = fabric.util.createClass(fabric.Image, {
    type: 'QRCode',

    /**
     * 初始化 QR Code
     * @param {string} data - 二维码内容（文本/URL）
     * @param {Object} qrOptions - 二维码配置参数
     * @param {Object} fabricOptions - Fabric.js 标准配置项
     */
    initialize: function (data, qrOptions = {}, fabricOptions = {}) {
      // 存储原始数据
      this._qrData = data || "testQr1111";
      this._qrOptions = {
        size: qrOptions.size || 200,
        version: qrOptions.version || 0,
        margin: qrOptions.margin || 0,
        errorCorrection: qrOptions.errorCorrection || 'L',
        foregroundColor: qrOptions.foregroundColor || '#000000',
        backgroundColor: qrOptions.backgroundColor || '#ffffff'
      };

      // 加载状态标记
      this._isLoading = true;
      this._loadError = null;

      // 构建图片URL
      const imageUrl = buildQRCodeURL(data, this._qrOptions);

      // 创建占位元素
      const placeholderImg = new Image();
      this.callSuper('initialize', placeholderImg, fabricOptions);

      // 开始加载
      this._loadQRCode(imageUrl, fabricOptions);
    },

    /**
     * 内部方法：加载二维码图片
     */
    _loadQRCode: async function (url, fabricOptions) {
      try {
        console.log("_loadQRCode, url:", url);
        // 使用 Promise 封装 fabric.Image.fromURL
        const img = await new Promise((resolve, reject) => {
          fabric.Image.fromURL(url, (img, isError) => {
            if (isError) {
              reject(new Error(`Failed to load QR code: ${url}`));
            } else {
              resolve(img);
            }
          }, { crossOrigin: 'anonymous' });
        });

        // 复制图片数据
        this._element = img._element;
        this.set({
          width: this._qrOptions.size,
          height: this._qrOptions.size,
          _element: img._element
        });

        // 应用 Fabric 样式属性
        if (fabricOptions.left !== undefined) this.set('left', fabricOptions.left);
        if (fabricOptions.top !== undefined) this.set('top', fabricOptions.top);
        if (fabricOptions.angle !== undefined) this.set('angle', fabricOptions.angle);
        if (fabricOptions.scaleX !== undefined) this.set('scaleX', fabricOptions.scaleX);
        if (fabricOptions.scaleY !== undefined) this.set('scaleY', fabricOptions.scaleY);

        this._isLoading = false;
        this.dirty = true;
        this.fire('qrloaded', { success: true, data: this._qrData });
      } catch (error) {
        console.error('QR Code load failed:', error);
        this._isLoading = false;
        this._loadError = error;
        this.fire('qrerror', { error, data: this._qrData });
      }
    },

    /**
     * 更新二维码内容或样式
     * @param {string} newData - 新内容（可选）
     * @param {Object} newOptions - 新样式参数（可选）
     */
    update: function (newData, newOptions = {}) {
      if (newData !== undefined) this._qrData = newData;

      // 合并新的样式参数
      Object.assign(this._qrOptions, newOptions);

      // 重新生成URL并加载
      const newUrl = buildQRCodeURL(this._qrData, this._qrOptions);
      this._isLoading = true;
      this._loadError = null;
      this.dirty = true;

      this._loadQRCode(newUrl, {
        left: this.left,
        top: this.top,
        angle: this.angle,
        scaleX: this.scaleX,
        scaleY: this.scaleY
      });
    },

    /**
     * 重新加载（刷新）
     */
    reload: function () {
      this.update();
    },

    /**
     * 获取当前配置
     */
    getConfig: function () {
      return {
        data: this._qrData,
        ...this._qrOptions
      };
    },

    /**
     * 渲染状态（加载中/失败/正常）
     */
    _render: function (ctx) {
      if (this._isLoading) {
        ctx.save();
        // 加载背景
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        // 加载动画（简单旋转线条）
        ctx.strokeStyle = '#2196f3';
        ctx.lineWidth = 2;
        const time = Date.now() / 500;
        const angle = (time % (Math.PI * 2));
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 3, angle, angle + Math.PI / 2);
        ctx.stroke();
        // 文字提示
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('加载二维码...', 0, 0);
        ctx.restore();
      } else if (this._loadError) {
        ctx.save();
        ctx.fillStyle = '#ffebee';
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.fillStyle = '#c62828';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('二维码加载失败', 0, -8);
        ctx.fillStyle = '#d32f2f';
        ctx.font = '10px Arial';
        ctx.fillText('点击刷新', 0, 12);
        ctx.restore();
      } else {
        this.callSuper('_render', ctx);
      }
    },

    /**
     * 点击处理（双击刷新或加载失败的提示）
     */
    _onMouseDown: function (e) {
      if (this._loadError) {
        this.reload();
      }
      return this.callSuper('_onMouseDown', e);
    },

    /**
     * 序列化（保存/恢复）
     */
    toObject: function () {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        qrData: this._qrData,
        qrOptions: { ...this._qrOptions },
        _isLoading: this._isLoading,
        _loadError: this._loadError ? this._loadError.message : null
      });
    }
  });

  // ==================== 3. 反序列化支持 ====================
  fabric.QRCode.fromObject = function (object, callback) {
    const qrCode = new fabric.QRCode(object.qrData, object.qrOptions, {
      left: object.left,
      top: object.top,
      width: object.width,
      height: object.height,
      angle: object.angle,
      scaleX: object.scaleX,
      scaleY: object.scaleY
    });
    callback && callback(qrCode);
    return qrCode;
  };

})()