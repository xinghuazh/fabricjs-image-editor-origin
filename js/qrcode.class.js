/**
 * Fabric.js QRCode 扩展类 - 使用 _render 方法直接绘制
 * 支持所有 QRCode 参数配置和完整的序列化/反序列化
 */

(function (fabric) {
  'use strict';

  if (!fabric) {
    throw new Error('Fabric.js is required');
  }

  // 等待 QRCode 加载完成
  function waitForQRCode(callback) {
    if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
      callback();
      return;
    }

    var checkInterval = setInterval(function () {
      if (typeof QRCode !== 'undefined' && QRCode.toDataURL) {
        clearInterval(checkInterval);
        callback();
      }
    }, 50);

    // 5秒超时
    setTimeout(function () {
      clearInterval(checkInterval);
      if (typeof QRCode === 'undefined') {
        console.error('QRCode library not loaded');
      }
    }, 5000);
  }

  /**
   * 默认 QRCode 配置参数
   */
  var DEFAULT_QR_OPTIONS = {
    width: 256,
    height: 256,
    margin: 4,
    version: null,
    correctLevel: 'H',
    maskPattern: null,
    encodingMode: 'auto',
    colorDark: '#000000',
    colorLight: '#ffffff',
    type: 'image/png',
    quality: 1
  };

  /**
   * 合并 QRCode 选项
   */
  function mergeQROptions(options) {
    return Object.assign({}, DEFAULT_QR_OPTIONS, options);
  }

  /**
   * QRCode 扩展类 - 基于 fabric.Image 但重载 _render
   */
  fabric.QRCode = fabric.util.createClass(fabric.Image, {
    type: 'qrcode',

    /**
     * 构造函数
     * @param {String} text 二维码内容
     * @param {Object} options Fabric 对象选项
     * @param {Object} qrOptions QRCode 生成选项
     */
    initialize: function (text, options, qrOptions) {
      var self = this;

      // 参数处理
      if (typeof text !== 'string') {
        qrOptions = options;
        options = text;
        text = options && options.text ? options.text : '';
      }

      options = options || {};

      // 保存二维码数据和配置
      this._qrText = text || '123456789';
      this._qrOptions = mergeQROptions(qrOptions || {});
      this._fabricOptions = Object.assign({}, options);

      // 图像相关
      this._qrImageElement = null;    // HTMLImageElement
      this._generatedDataURL = null;   // 生成的 DataURL
      this._isGenerating = false;
      this._isGenerated = false;
      this._generationPromise = null;
      this._generationResolve = null;
      this._generationReject = null;

      // 设置尺寸（用于边界框）
      var width = this._qrOptions.width;
      var height = this._qrOptions.height;

      // 调用父类初始化（创建空的 fabric.Image）
      this.callSuper('initialize', null, Object.assign({
        width: width,
        height: height,
        originX: 'left',
        originY: 'top'
      }, options));

      // 自动生成二维码
      if (this._qrText) {
        // 等待 QRCode 库加载完成后再生成
        waitForQRCode(function () {
          self._generateQRCode();
        });
      }
    },

    /**
     * 生成二维码（异步）
     * @private
     * @returns {Promise}
     */
    _generateQRCode: function () {
      var self = this;

      if (this._isGenerating && this._generationPromise) {
        return this._generationPromise;
      }

      // 检查 QRCode 是否可用
      if (typeof QRCode === 'undefined' || !QRCode.toDataURL) {
        console.error('QRCode library not available');
        return Promise.reject(new Error('QRCode library not available'));
      }

      this._isGenerating = true;

      var qrOptions = Object.assign({}, this._qrOptions);
      qrOptions.width = this.width || this._qrOptions.width;
      qrOptions.height = this.height || this._qrOptions.height;

      console.log('Generating QRCode for:', this._qrText);
      console.log('QRCode options:', qrOptions);

      this._generationPromise = QRCode.toDataURL(this._qrText, qrOptions)
        .then(function (dataURL) {
          console.log("QRCode generation success, dataURL length:", dataURL.length);
          self._generatedDataURL = dataURL;
          return self._loadImageFromDataURL(dataURL);
        })
        .then(function (imgElement) {
          console.log("Image loaded successfully");
          self._qrImageElement = imgElement;
          self._isGenerated = true;
          self._isGenerating = false;

          // 触发重新渲染
          if (self.canvas) {
            self.canvas.renderAll();
            self.canvas.fire('qrcode:generated', {
              target: self,
              text: self._qrText,
              options: self._qrOptions
            });
          }

          return self;
        })
        .catch(function (err) {
          console.error('QRCode generation failed:', err);
          self._isGenerating = false;
          self._isGenerated = false;
          self._qrImageElement = null;

          if (self.canvas) {
            self.canvas.fire('qrcode:error', {
              target: self,
              error: err,
              text: self._qrText
            });
          }

          throw err;
        });

      return this._generationPromise;
    },

    /**
     * 从 DataURL 加载图像
     * @private
     */
    _loadImageFromDataURL: function (dataURL) {
      return new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () {
          console.log('Image onload triggered, size:', img.width, 'x', img.height);
          resolve(img);
        };
        img.onerror = function (err) {
          console.error('Image load error:', err);
          reject(new Error('Failed to load image from dataURL'));
        };
        img.src = dataURL;
      });
    },

    /**
     * 重载 _render 方法 - 直接绘制二维码图像
     * @param {CanvasRenderingContext2D} ctx Canvas 上下文
     */
    _render: function (ctx) {
      if (!this._qrImageElement && this._generatedDataURL) {
        // 如果已有 DataURL 但没有 Image 元素，重新加载
        var self = this;
        this._loadImageFromDataURL(this._generatedDataURL)
          .then(function (img) {
            self._qrImageElement = img;
            self._renderImage(ctx);
            if (self.canvas) {
              self.canvas.renderAll();
            }
          })
          .catch(function (err) {
            console.error('Failed to reload image:', err);
          });
        return;
      }

      if (this._qrImageElement) {
        this._renderImage(ctx);
      }
    },

    /**
     * 实际绘制图像
     * @private
     */
    _renderImage: function (ctx) {
      if (!this._qrImageElement) return;

      var w = this.width;
      var h = this.height;
      var x = -w / 2;
      var y = -h / 2;

      // 应用缩放
      var scaleX = this.scaleX || 1;
      var scaleY = this.scaleY || 1;
      var scaledW = w * scaleX;
      var scaledH = h * scaleY;
      var scaledX = x * scaleX;
      var scaledY = y * scaleY;

      // 保存上下文状态
      ctx.save();

      // 应用变换（旋转、位置等）
      ctx.transform(
        this.cosAngle * scaleX, this.sinAngle * scaleX,
        -this.sinAngle * scaleY, this.cosAngle * scaleY,
        this.left, this.top
      );

      // 应用透明度
      if (this.opacity !== undefined && this.opacity !== 1) {
        ctx.globalAlpha = this.opacity;
      }

      // 绘制图像
      try {
        ctx.drawImage(
          this._qrImageElement,
          scaledX, scaledY,
          scaledW, scaledH
        );
      } catch (e) {
        console.warn('Failed to draw image:', e);
      }

      // 恢复上下文
      ctx.restore();
    },

    /**
     * 重新生成二维码
     * @param {String} newText 新内容
     * @param {Object} newOptions 新选项
     * @returns {Promise}
     */
    regenerate: function (newText, newOptions) {
      if (newText !== undefined) {
        this._qrText = newText;
      }

      if (newOptions) {
        this._qrOptions = mergeQROptions(Object.assign({}, this._qrOptions, newOptions));
      }

      // 更新尺寸
      if (this._qrOptions.width !== this.width) {
        this.set('width', this._qrOptions.width);
      }
      if (this._qrOptions.height !== this.height) {
        this.set('height', this._qrOptions.height);
      }

      this._isGenerated = false;
      this._qrImageElement = null;
      this._generatedDataURL = null;
      this._generationPromise = null;

      return this._generateQRCode();
    },

    /**
     * 更新配置
     * @param {Object} options 新配置
     * @param {Boolean} autoRegenerate 是否自动重新生成
     * @returns {Promise}
     */
    updateOptions: function (options, autoRegenerate) {
      this._qrOptions = mergeQROptions(Object.assign({}, this._qrOptions, options));

      if (autoRegenerate !== false) {
        return this.regenerate();
      }

      return Promise.resolve(this);
    },

    /**
     * 获取二维码内容
     * @returns {String}
     */
    getText: function () {
      return this._qrText;
    },

    /**
     * 设置二维码内容
     * @param {String} text 新内容
     * @returns {Promise}
     */
    setText: function (text) {
      return this.regenerate(text);
    },

    /**
     * 获取配置
     * @returns {Object}
     */
    getQROptions: function () {
      return Object.assign({}, this._qrOptions);
    },

    /**
     * 获取 DataURL
     * @returns {String|null}
     */
    getDataURL: function () {
      return this._generatedDataURL;
    },

    /**
     * 获取状态
     * @returns {Object}
     */
    getStatus: function () {
      return {
        isGenerating: this._isGenerating,
        isGenerated: this._isGenerated,
        hasImage: !!this._qrImageElement,
        hasDataURL: !!this._generatedDataURL,
        text: this._qrText
      };
    },

    /**
     * 从 DataURL 设置图像（用于快速加载）
     * @param {String} dataURL
     * @returns {Promise}
     */
    setImageFromDataURL: function (dataURL) {
      var self = this;
      this._generatedDataURL = dataURL;

      return this._loadImageFromDataURL(dataURL)
        .then(function (img) {
          self._qrImageElement = img;
          self._isGenerated = true;
          self._isGenerating = false;

          if (self.canvas) {
            self.canvas.renderAll();
          }

          return self;
        })
        .catch(function (err) {
          console.error('Failed to set image from dataURL:', err);
          throw err;
        });
    },

    /**
     * 重写 set 方法，确保 scaleX/scaleY 始终为 1
     * @param {String|Object} key
     * @param {*} value
     * @returns {fabric.QRCode}
     */
    set: function (key, value) {
      if (typeof key === 'object') {
        // 如果传入的对象中包含 scaleX 或 scaleY，强制设为 1
        if (key.scaleX !== undefined) {
          key.scaleX = 1;
        }
        if (key.scaleY !== undefined) {
          key.scaleY = 1;
        }
      } else {
        if (key === 'scaleX' || key === 'scaleY') {
          return this.callSuper('set', key, 1);
        }
      }

      return this.callSuper('set', key, value);
    },

    /**
     * 序列化为对象
     * @param {Array} propertiesToInclude
     * @returns {Object}
     */
    toObject: function (propertiesToInclude) {
      var base = this.callSuper('toObject', propertiesToInclude);

      return fabric.util.object.extend(base, {
        qrText: this._qrText,
        qrOptions: this._qrOptions,
        fabricOptions: this._fabricOptions,
        generatedDataURL: this._generatedDataURL,
        subtype: 'qrcode'
      });
    },
  });

  /**
   * 从对象创建实例
   * @param {Object} object JSON 对象
   * @param {Function} callback 回调
   */
  fabric.QRCode.fromObject = function (object, callback) {
    // 优先使用已保存的 DataURL
    if (object.generatedDataURL) {
      var qrcode = new fabric.QRCode(object.qrText || '', {
        left: object.left,
        top: object.top,
        width: object.width,
        height: object.height,
        scaleX: object.scaleX,
        scaleY: object.scaleY,
        angle: object.angle,
        opacity: object.opacity,
        originX: object.originX,
        originY: object.originY,
        selectable: object.selectable,
        hasControls: object.hasControls,
        hasBorders: object.hasBorders
      }, object.qrOptions);

      // 等待 QRCode 库加载完成
      waitForQRCode(function () {
        qrcode.setImageFromDataURL(object.generatedDataURL)
          .then(function () {
            if (callback) callback(qrcode);
          })
          .catch(function () {
            if (callback) callback(qrcode);
          });
      });
      return;
    }

    // 没有保存的 DataURL，重新生成
    var qrcode = new fabric.QRCode(
      object.qrText || '',
      object.fabricOptions || object,
      object.qrOptions
    );

    if (qrcode._isGenerating) {
      qrcode._generationPromise.then(function () {
        if (callback) callback(qrcode);
      }).catch(function () {
        if (callback) callback(qrcode);
      });
    } else {
      if (callback) callback(qrcode);
    }
  };

  /**
   * 批量创建二维码
   * @param {Array} items
   * @returns {Array}
   */
  fabric.QRCode.batchCreate = function (items) {
    return items.map(function (item) {
      return new fabric.QRCode(
        item.text,
        item.fabricOptions || {},
        item.qrOptions || {}
      );
    });
  };

})(typeof fabric !== 'undefined' ? fabric : null);