/**
 * Define action to draw circle by mouse actions
 */
(function () {
  //---------------------------------------------------------------------------
  // 创建半圆类
  fabric.Semicircle = fabric.util.createClass(fabric.Object, {
    type: 'Semicircle',

    initialize: function (options) {
      console.log("Semicircle init, options:", options);
      options || (options = {});

        // 合并默认锁定属性
        const defaultLocks = {
            lockScalingX: true,
            lockScalingY: true,
            lockScalingFlip: true
        };
        
        // 让传入的 options 可以覆盖默认值
        Object.assign(options, defaultLocks, options);
        
      this.callSuper('initialize', options);
      this.width = 100;
      this.height = 50;
      this.set('label', options.label || '');
    },

    _render: function (ctx) {
      ctx.save();
      ctx.strokeStyle = this.stroke || '#333';
      ctx.fillStyle = this.fill || '#333';
      ctx.lineWidth = this.strokeWidth || 1;

      ctx.beginPath();
      // 绘制半圆：圆心(0, -25)，半径50，从0度到180度
      ctx.arc(0, -25, 50, 0, Math.PI);
      ctx.closePath();

      ctx.stroke();
      ctx.fill();
      ctx.restore();

      // 再绘制文本标签
      ctx.font = this.labelFont || '20px Helvetica';
      ctx.fillStyle = this.labelFill || '#333';
      ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 20);
    },

    toObject: function () {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        label: this.get('label')
      });
    },

  });

  fabric.Semicircle.fromObject = function(object, callback) {
    console.log("Semicircle fromObject, options:", object, ", callback:", callback);

    return fabric.Object._fromObject('Semicircle', object, callback);
  };

  //---------------------------------------------------------------------------
  var circleDrawing = function (fabricCanvas) {
    let isDrawingCircle = false;
    let _obj, pointer, pointerPoints;

    fabricCanvas.on('mouse:down', (o) => {
      if (!fabricCanvas.isDrawingCircleMode) return;

      isDrawingCircle = true;
      pointer = fabricCanvas.getPointer(o.e);
      pointerPoints = [pointer.x, pointer.y, pointer.x, pointer.y];

      _obj = new fabric.Semicircle({
        left: pointer.x,
        top: pointer.y,
        fill: '#ed5736',
        stroke: '#7bcfa6',
        strokeWidth: 5,
        label: 'Hello111',

        // // 禁止缩放的相关属性
        // lockScalingX: true,      // 禁止水平缩放
        // lockScalingY: true,      // 禁止垂直缩放
        // lockScalingFlip: true,   // 禁止翻转缩放
        // hasControls: false,      // 可选：隐藏控制点（彻底无法缩放）
      });
      _obj.selectable = false;
      _obj.evented = false;
      _obj.strokeUniform = true;
      fabricCanvas.add(_obj);
    });

    fabricCanvas.on('mouse:move', (o) => {
      if (!isDrawingCircle) return;

      pointer = fabricCanvas.getPointer(o.e);

      if (o.e.shiftKey) {
        // calc angle
        let startX = pointerPoints[0];
        let startY = pointerPoints[1];
        let x2 = pointer.x - startX;
        let y2 = pointer.y - startY;
        let r = Math.sqrt(x2 * x2 + y2 * y2);
        let angle = (Math.atan2(y2, x2) / Math.PI * 180);

        angle = parseInt(((angle + 7.5) % 360) / 15) * 15;

        let cosx = r * Math.cos(angle * Math.PI / 180);
        let sinx = r * Math.sin(angle * Math.PI / 180);

        _obj.set({
          x2: cosx + startX,
          y2: sinx + startY
        })

      } else {
        _obj.set({
          x2: pointer.x,
          y2: pointer.y
        })
      }

      fabricCanvas.renderAll();

    });

    fabricCanvas.on('mouse:up', () => {
      if (!isDrawingCircle) return;

      _obj.setCoords();
      isDrawingCircle = false;
      fabricCanvas.trigger('object:modified');
    });
  }

  window.ImageEditor.prototype.initializeCircleDrawing = circleDrawing;
})()