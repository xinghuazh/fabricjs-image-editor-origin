(function (global) {

  'use strict';

  var fabric = global.fabric || (global.fabric = {}),
    extend = fabric.util.object.extend;

  if (fabric.PatternShape) {
    fabric.warn('fabric.Pattern is already defined');
    return;
  }
  fabric.PatternShape = fabric.util.createClass(fabric.Object, {

    type: 'patternShape',

    // 自定义属性
    patternType: 2,  // 0: 实心, 1: 条纹, 2: 网格, 3: 点阵
    rowNum: 4,

    // 声明需要序列化的属性
    stateProperties: fabric.Object.prototype.stateProperties.concat('patternType', 'rowNum'),
    cacheProperties: fabric.Object.prototype.cacheProperties.concat('patternType', 'rowNum'),

    initialize: function (options) {
      // 调用父类初始化
      this.callSuper('initialize', options);
      // 设置默认尺寸
      this.width = this.width || 120;
      this.height = this.height || 120;
    },

    // 核心渲染方法
    _render: function (ctx) {
      const w = this.width;
      const h = this.height;
      const type = this.patternType || 0;
      const rows = this.rowNum || 4;

      // 清空区域
      ctx.clearRect(-w / 2, -h / 2, w, h);

      // 根据不同类型绘制
      switch (type) {
        case 0: // 实心
          this._renderSolid(ctx, w, h);
          break;
        case 1: // 条纹
          this._renderStripes(ctx, w, h, rows);
          break;
        case 2: // 网格
          this._renderGrid(ctx, w, h, rows);
          break;
        case 3: // 点阵
          this._renderDots(ctx, w, h, rows);
          break;
        default:
          this._renderSolid(ctx, w, h);
      }

      // 绘制边框
      ctx.save();
      ctx.strokeStyle = this.stroke || '#2c3e50';
      ctx.lineWidth = this.strokeWidth || 2;
      ctx.strokeRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    },

    // 实心填充
    _renderSolid: function (ctx, w, h) {
      ctx.save();
      ctx.fillStyle = this.fill || '#4a6cf7';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
    },

    // 条纹
    _renderStripes: function (ctx, w, h, rows) {
      ctx.save();
      const stripeWidth = w / rows;
      for (let i = 0; i < rows; i++) {
        ctx.fillStyle = i % 2 === 0 ? (this.fill || '#4a6cf7') : (this.secondaryColor || '#e8ecf1');
        ctx.fillRect(-w / 2 + i * stripeWidth, -h / 2, stripeWidth, h);
      }
      ctx.restore();
    },

    // 网格
    _renderGrid: function (ctx, w, h, rows) {
      ctx.save();
      const cellSize = Math.min(w, h) / rows;
      const cols = Math.ceil(w / cellSize);
      const actualRows = Math.ceil(h / cellSize);

      for (let r = 0; r < actualRows; r++) {
        for (let c = 0; c < cols; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? (this.fill || '#4a6cf7') : (this.secondaryColor || '#e8ecf1');
          ctx.fillRect(-w / 2 + c * cellSize, -h / 2 + r * cellSize, cellSize, cellSize);
        }
      }
      ctx.restore();
    },

    // 点阵
    _renderDots: function (ctx, w, h, rows) {
      ctx.save();
      const spacing = Math.min(w, h) / (rows + 1);
      const radius = spacing * 0.25;
      const cols = Math.floor(w / spacing);

      for (let r = 1; r <= rows; r++) {
        for (let c = 1; c <= cols; c++) {
          ctx.beginPath();
          ctx.arc(-w / 2 + c * spacing, -h / 2 + r * spacing, radius, 0, Math.PI * 2);
          ctx.fillStyle = this.fill || '#4a6cf7';
          ctx.fill();
        }
      }
      ctx.restore();
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
        if (key.left !== undefined) {
          key.left = 0;
        }
        if (key.top !== undefined) {
          key.top = 0;
        }
      } else {
        if (key === 'scaleX' || key === 'scaleY') {
          return this.callSuper('set', key, 1);
        }
        if (key === 'left' || key === 'top') {
          return this.callSuper('set', key, 0);
        }
      }

      return this.callSuper('set', key, value);
    },

    // 序列化
    toObject: function (propertiesToInclude) {
      return this.callSuper('toObject', ['patternType', 'rowNum'].concat(propertiesToInclude || []));
    }
  });

  // 从对象恢复
  fabric.PatternShape.fromObject = function (object, callback) {
    return fabric.Object._fromObject('PatternShape', object, callback);
  };

})(typeof exports !== 'undefined' ? exports : this);

