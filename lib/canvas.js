/**
 * Canvas section management of image editor
 */
(function () {
  'use strict';
  fabric.SafeCanvas = fabric.util.createClass(fabric.Canvas, {
    type: 'SafeCanvas',

    initialize: function (element, options) {
      options || (options = {});

      // 调用父类初始化
      this.callSuper('initialize', element, options);

      // ========== 防抖动配置 ==========
      this.antiShakeDelay = options.antiShakeDelay || 500;
      this.antiShakeEnabled = options.antiShakeEnabled !== false;
      this.antiShakeThreshold = options.antiShakeThreshold || 5;

      // ========== 对齐黏附配置 ==========
      this.snapEnabled = options.snapEnabled !== false;      // 是否启用对齐
      this.snapThreshold = options.snapThreshold || 10;       // 吸附阈值（像素）
      this.snapShowLines = options.snapShowLines !== false;   // 是否显示对齐线
      this.snapToObjects = options.snapToObjects !== false;   // 是否吸附到其他对象
      this.snapToCenter = options.snapToCenter !== false;     // 是否吸附到中心点
      this.snapToEdges = options.snapToEdges !== false;       // 是否吸附到边缘

      // 对齐线样式
      this.snapLineColor = options.snapLineColor || '#ff5722';
      this.snapLineWidth = options.snapLineWidth || 1;
      this.snapLineDash = options.snapLineDash || [5, 5];

      // ========== 内部状态 ==========
      // 防抖动状态
      this._isDraggingEnabled = false;
      this._dragTimer = null;
      this._currentTarget = null;
      this._startPointer = null;
      this._originalControlsState = null;

      // 对齐黏附状态
      this._snapLines = [];           // 当前显示的对齐线
      this._originalPosition = null;  // 拖拽开始时的原始位置
      this._snapOffset = { x: 0, y: 0 };  // 吸附偏移量

      // 绑定事件
      this._bindAntiShakeEvents();
      this._bindSnapEvents();

      // 保存原始方法的引用（用于拦截移动）
      this._originalObjectMoving = null;
    },

    // ==================== 对齐黏附事件绑定 ====================

    _bindSnapEvents: function () {
      // 拖拽开始时记录原始位置
      this.on('object:moving', this._onObjectMoving.bind(this));
    },

    /**
     * 对象移动时的吸附处理
     */
    _onObjectMoving: function (e) {
      if (!this.snapEnabled || !this._isDraggingEnabled) {
        return;
      }

      const target = e.target;
      if (!target) return;

      // 清除之前的对齐线
      this._snapLines = [];

      // 获取所有其他对象
      const objects = this.getObjects().filter(obj => obj !== target && !obj.isDrawingMode);

      if (objects.length === 0) return;

      // 获取对象的边界
      const targetBounds = this._getObjectBounds(target);

      // 存储找到的对齐信息
      const snaps = [];

      // 检查与其他对象的对齐
      for (const obj of objects) {
        const objBounds = this._getObjectBounds(obj);

        // 边缘对齐检测
        if (this.snapToEdges) {
          // 水平对齐：左边缘、中心、右边缘
          this._checkEdgeSnap(targetBounds, objBounds, target, snaps);
        }

        // 中心点对齐检测
        if (this.snapToCenter) {
          this._checkCenterSnap(targetBounds, objBounds, target, snaps);
        }
      }

      // 应用最强的吸附（最近的）
      if (snaps.length > 0) {
        // 按距离排序，取最近的
        snaps.sort((a, b) => a.distance - b.distance);
        const bestSnap = snaps[0];

        // 应用吸附
        target.set({
          left: bestSnap.left,
          top: bestSnap.top
        });
        target.setCoords();

        // 添加对齐线
        if (this.snapShowLines && bestSnap.linePoints) {
          this._addSnapLines(bestSnap.linePoints);
        }
      }

      // 渲染对齐线
      this.renderAll();
    },

    /**
     * 获取对象的边界（考虑旋转后的实际位置）
     */
    _getObjectBounds: function (obj) {
      const aCoords = obj.aCoords || obj.getCoords();
      if (!aCoords) {
        // 降级方案：使用简单的边界
        return {
          left: obj.left,
          top: obj.top,
          right: obj.left + (obj.width * obj.scaleX),
          bottom: obj.top + (obj.height * obj.scaleY),
          centerX: obj.left + (obj.width * obj.scaleX) / 2,
          centerY: obj.top + (obj.height * obj.scaleY) / 2
        };
      }

      // 获取实际的边界坐标
      const left = Math.min(aCoords.tl.x, aCoords.bl.x, aCoords.tr.x, aCoords.br.x);
      const right = Math.max(aCoords.tl.x, aCoords.bl.x, aCoords.tr.x, aCoords.br.x);
      const top = Math.min(aCoords.tl.y, aCoords.bl.y, aCoords.tr.y, aCoords.br.y);
      const bottom = Math.max(aCoords.tl.y, aCoords.bl.y, aCoords.tr.y, aCoords.br.y);

      return {
        left: left,
        right: right,
        top: top,
        bottom: bottom,
        centerX: (left + right) / 2,
        centerY: (top + bottom) / 2,
        width: right - left,
        height: bottom - top
      };
    },

    /**
     * 检查边缘对齐
     */
    _checkEdgeSnap: function (targetBounds, objBounds, target, snaps) {
      const threshold = this.snapThreshold;

      // 左边缘对齐左边缘
      this._checkAndAddSnap(
        targetBounds.left, objBounds.left,
        targetBounds.left, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.left - objBounds.left),
            linePoints: this._getVerticalLinePoints(newLeft, targetBounds, objBounds)
          });
        },
        threshold, targetBounds.left, objBounds.left
      );

      // 左边缘对齐右边缘
      this._checkAndAddSnap(
        targetBounds.left, objBounds.right,
        targetBounds.left, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.left - objBounds.right),
            linePoints: this._getVerticalLinePoints(newLeft, targetBounds, objBounds)
          });
        },
        threshold, targetBounds.left, objBounds.right
      );

      // 右边缘对齐左边缘
      this._checkAndAddSnap(
        targetBounds.right, objBounds.left,
        targetBounds.right - targetBounds.width, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.right - objBounds.left),
            linePoints: this._getVerticalLinePoints(objBounds.left, targetBounds, objBounds)
          });
        },
        threshold, targetBounds.right, objBounds.left
      );

      // 右边缘对齐右边缘
      this._checkAndAddSnap(
        targetBounds.right, objBounds.right,
        targetBounds.right - targetBounds.width, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.right - objBounds.right),
            linePoints: this._getVerticalLinePoints(objBounds.right, targetBounds, objBounds)
          });
        },
        threshold, targetBounds.right, objBounds.right
      );

      // 中心对齐垂直
      this._checkAndAddSnap(
        targetBounds.centerX, objBounds.centerX,
        targetBounds.centerX - targetBounds.width / 2, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.centerX - objBounds.centerX),
            linePoints: this._getVerticalLinePoints(objBounds.centerX, targetBounds, objBounds)
          });
        },
        threshold, targetBounds.centerX, objBounds.centerX
      );
    },

    /**
     * 检查中心点对齐
     */
    _checkCenterSnap: function (targetBounds, objBounds, target, snaps) {
      const threshold = this.snapThreshold;

      // 垂直中心线
      this._checkAndAddSnap(
        targetBounds.centerX, objBounds.centerX,
        targetBounds.centerX - targetBounds.width / 2, targetBounds.top,
        (newLeft) => {
          snaps.push({
            left: newLeft,
            top: target.top,
            distance: Math.abs(targetBounds.centerX - objBounds.centerX),
            linePoints: [{
              x: objBounds.centerX,
              y1: Math.min(targetBounds.top, objBounds.top),
              y2: Math.max(targetBounds.bottom, objBounds.bottom)
            }]
          });
        },
        threshold, targetBounds.centerX, objBounds.centerX
      );

      // 水平中心线
      this._checkAndAddSnap(
        targetBounds.centerY, objBounds.centerY,
        target.left, targetBounds.centerY - targetBounds.height / 2,
        (newTop) => {
          snaps.push({
            left: target.left,
            top: newTop,
            distance: Math.abs(targetBounds.centerY - objBounds.centerY),
            linePoints: [{
              y: objBounds.centerY,
              x1: Math.min(targetBounds.left, objBounds.left),
              x2: Math.max(targetBounds.right, objBounds.right)
            }]
          });
        },
        threshold, targetBounds.centerY, objBounds.centerY
      );
    },

    /**
     * 辅助方法：检查并添加吸附
     */
    _checkAndAddSnap: function (targetValue, snapValue, newLeft, newTop, addSnapCallback, threshold, targetValueCheck, snapValueCheck) {
      const diff = Math.abs(targetValueCheck - snapValueCheck);
      if (diff <= threshold) {
        addSnapCallback(newLeft, newTop);
      }
    },

    /**
     * 获取垂直线段的坐标点
     */
    _getVerticalLinePoints: function (x, targetBounds, objBounds) {
      const y1 = Math.min(targetBounds.top, objBounds.top);
      const y2 = Math.max(targetBounds.bottom, objBounds.bottom);
      return [{ x: x, y1: y1, y2: y2 }];
    },

    /**
     * 获取水平线段的坐标点
     */
    _getHorizontalLinePoints: function (y, targetBounds, objBounds) {
      const x1 = Math.min(targetBounds.left, objBounds.left);
      const x2 = Math.max(targetBounds.right, objBounds.right);
      return [{ y: y, x1: x1, x2: x2 }];
    },

    /**
     * 添加对齐线
     */
    _addSnapLines: function (linePoints) {
      for (const point of linePoints) {
        if (point.x !== undefined) {
          // 垂直线
          this._snapLines.push({
            type: 'vertical',
            x: point.x,
            y1: point.y1,
            y2: point.y2
          });
        } else if (point.y !== undefined) {
          // 水平线
          this._snapLines.push({
            type: 'horizontal',
            y: point.y,
            x1: point.x1,
            x2: point.x2
          });
        }
      }
    },

    // ==================== 防抖动事件（与之前相同） ====================

    _bindAntiShakeEvents: function () {
      this.on('mouse:down', this._onAntiShakeMouseDown.bind(this));
      this.on('mouse:move', this._onAntiShakeMouseMove.bind(this));
      this.on('mouse:up', this._onAntiShakeMouseUp.bind(this));
    },

    _onAntiShakeMouseDown: function (e) {
      if (!this.antiShakeEnabled) {
        this._isDraggingEnabled = true;
        return;
      }

      const target = e.target;
      if (!target) return;

      this._currentTarget = target;
      this._startPointer = {
        x: e.absolutePointer.x,
        y: e.absolutePointer.y
      };
      this._isDraggingEnabled = false;

      // 保存原始位置
      this._originalPosition = {
        left: target.left,
        top: target.top
      };

      this._originalControlsState = {
        hasControls: target.hasControls,
        lockMovementX: target.lockMovementX,
        lockMovementY: target.lockMovementY,
        borderColor: target.borderColor
      };

      target.set({
        hasControls: false,
        lockMovementX: true,
        lockMovementY: true,
        borderColor: '#cccccc'
      });
      target.setCoords();
      this.renderAll();

      this._dragTimer = setTimeout(() => {
        this._enableAntiShakeDragging();
      }, this.antiShakeDelay);

      this.fire('antiShake:waiting', { target: target });
    },

    _onAntiShakeMouseMove: function (e) {
      if (!this.antiShakeEnabled) return;
      if (!this._currentTarget) return;

      if (this._isDraggingEnabled) return;

      if (this._startPointer) {
        const deltaX = Math.abs(e.absolutePointer.x - this._startPointer.x);
        const deltaY = Math.abs(e.absolutePointer.y - this._startPointer.y);

        if (deltaX > this.antiShakeThreshold || deltaY > this.antiShakeThreshold) {
          this._cancelAntiShakeDrag();
        }
      }
    },

    _onAntiShakeMouseUp: function (e) {
      if (!this.antiShakeEnabled) return;

      if (this._dragTimer) {
        clearTimeout(this._dragTimer);
        this._dragTimer = null;
      }

      if (this._currentTarget && !this._isDraggingEnabled && this._originalControlsState) {
        this._currentTarget.set({
          hasControls: this._originalControlsState.hasControls,
          lockMovementX: this._originalControlsState.lockMovementX,
          lockMovementY: this._originalControlsState.lockMovementY,
          borderColor: this._originalControlsState.borderColor
        });
        this._currentTarget.setCoords();
        this.renderAll();
      }

      // 清除对齐线
      this._snapLines = [];
      this.renderAll();

      this._isDraggingEnabled = false;
      this._currentTarget = null;
      this._startPointer = null;
      this._originalPosition = null;
      this._originalControlsState = null;

      this.fire('antiShake:released');
    },

    _enableAntiShakeDragging: function () {
      if (!this._currentTarget) return;

      this._isDraggingEnabled = true;

      this._currentTarget.set({
        hasControls: true,
        lockMovementX: false,
        lockMovementY: false,
        borderColor: '#2196f3'
      });
      this._currentTarget.setCoords();
      this.renderAll();

      this.fire('antiShake:enabled', { target: this._currentTarget });
    },

    _cancelAntiShakeDrag: function () {
      if (this._dragTimer) {
        clearTimeout(this._dragTimer);
        this._dragTimer = null;
      }

      if (this._currentTarget && !this._isDraggingEnabled && this._originalControlsState) {
        // 恢复原始位置
        if (this._originalPosition) {
          this._currentTarget.set({
            left: this._originalPosition.left,
            top: this._originalPosition.top
          });
        }
        this._currentTarget.set({
          hasControls: this._originalControlsState.hasControls,
          lockMovementX: this._originalControlsState.lockMovementX,
          lockMovementY: this._originalControlsState.lockMovementY,
          borderColor: this._originalControlsState.borderColor
        });
        this._currentTarget.setCoords();
        this.renderAll();
      }

      this._snapLines = [];
      this.renderAll();

      this._isDraggingEnabled = false;
      this._currentTarget = null;
      this._startPointer = null;
      this._originalPosition = null;
      this._originalControlsState = null;

      this.fire('antiShake:cancelled');
    },

    // ==================== 渲染对齐线 ====================

    /**
     * 重写 renderAll 方法，在渲染完对象后渲染对齐线
     */
    renderAll: function () {
      this.callSuper('renderAll');
      if (this.snapShowLines && this._snapLines.length > 0) {
        this._renderSnapLines();
      }
    },

    /**
     * 渲染对齐线
     */
    _renderSnapLines: function () {
      const ctx = this.contextContainer;
      if (!ctx) return;

      ctx.save();
      ctx.strokeStyle = this.snapLineColor;
      ctx.lineWidth = this.snapLineWidth;

      if (this.snapLineDash && this.snapLineDash.length > 0) {
        ctx.setLineDash(this.snapLineDash);
      }

      for (const line of this._snapLines) {
        ctx.beginPath();
        if (line.type === 'vertical') {
          ctx.moveTo(line.x, line.y1);
          ctx.lineTo(line.x, line.y2);
        } else if (line.type === 'horizontal') {
          ctx.moveTo(line.x1, line.y);
          ctx.lineTo(line.x2, line.y);
        }
        ctx.stroke();
      }

      ctx.restore();
    },

    // ==================== 配置方法 ====================

    setAntiShakeEnabled: function (enabled) {
      this.antiShakeEnabled = enabled;
      if (!enabled && this._dragTimer) {
        clearTimeout(this._dragTimer);
        this._dragTimer = null;
        if (this._currentTarget && !this._isDraggingEnabled && this._originalControlsState) {
          if (this._originalPosition) {
            this._currentTarget.set({
              left: this._originalPosition.left,
              top: this._originalPosition.top
            });
          }
          this._currentTarget.set({
            hasControls: this._originalControlsState.hasControls,
            lockMovementX: this._originalControlsState.lockMovementX,
            lockMovementY: this._originalControlsState.lockMovementY,
            borderColor: this._originalControlsState.borderColor
          });
          this._currentTarget.setCoords();
          this.renderAll();
        }
        this._currentTarget = null;
        this._isDraggingEnabled = false;
        this._originalControlsState = null;
        this._snapLines = [];
      }
      this.renderAll();
    },

    setAntiShakeDelay: function (delay) {
      this.antiShakeDelay = delay;
    },

    setAntiShakeThreshold: function (threshold) {
      this.antiShakeThreshold = threshold;
    },

    /**
     * 启用/禁用对齐功能
     */
    setSnapEnabled: function (enabled) {
      this.snapEnabled = enabled;
      if (!enabled) {
        this._snapLines = [];
        this.renderAll();
      }
    },

    /**
     * 设置吸附阈值
     */
    setSnapThreshold: function (threshold) {
      this.snapThreshold = threshold;
    },

    /**
     * 设置对齐线颜色
     */
    setSnapLineColor: function (color) {
      this.snapLineColor = color;
    },

    getAntiShakeState: function () {
      return {
        enabled: this.antiShakeEnabled,
        delay: this.antiShakeDelay,
        threshold: this.antiShakeThreshold,
        isWaiting: this._dragTimer !== null,
        canDrag: this._isDraggingEnabled,
        snapEnabled: this.snapEnabled,
        snapThreshold: this.snapThreshold
      };
    },

    toObject: function (propertiesToInclude = []) {
      console.log("SafeCanvas::toObject");
      // 调用父类的 toObject，并合并自定义属性
      const parentObject = this.callSuper('toObject', propertiesToInclude);

      const pageInfo = {
        pageWidth: this.pageWidth || 210.0,
        pageHeight: this.pageHeight || 297.0,
        productId: this.productId || 0,
        refDataId: this.refDataId || 0,
        refPdfId: this.refPdfId || 0,

      };
      
      // 添加自定义属性
      const customProps = {
        tag: 'fabricLayout',
        version: '333',
        author: this.customAuthor || 'admin',
        lastModified: new Date().toISOString(),

        width: this.width,
        height: this.height,
        zoom: this.getZoom(),
        pageInfo: pageInfo,
        // antiShakeDelay: this.antiShakeDelay,
        // antiShakeEnabled: this.antiShakeEnabled,
        // antiShakeThreshold: this.antiShakeThreshold,
        // snapEnabled: this.snapEnabled,
        // snapThreshold: this.snapThreshold,
        // snapShowLines: this.snapShowLines,
        // snapLineColor: this.snapLineColor
      };
      
      // 使用 extend 合并对象
      return fabric.util.object.extend(customProps, parentObject);
    },

    // 可选：重写 toJSON 确保调用正确
    toJSON: function (propertiesToInclude = []) {
      console.log("toJSON called on SafeCanvas");
      return this.toObject(propertiesToInclude);
    }
  });

  // 注册 fromObject 方法
  fabric.SafeCanvas.fromObject = function (object, callback) {
    const canvas = new fabric.SafeCanvas(object.element, object);
    callback && callback(canvas);
    return canvas;
  };

  //---------------------------------------------------------------------------
  var canvas = function () {
    //try {
    $(`${this.containerSelector} .main-panel`).append(`
        <div class="canvas-holder" id="canvas-holder">
          <div class="content canvas-wrapper" style="position: relative;">
            <canvas id="ruler-canvas"></canvas>
            <canvas id="c1"></canvas>
          </div>
        </div>`);

    const fabricCanvas = new fabric.SafeCanvas('c1', {
      width: 801,
      height: 601,
      antiShakeDelay: 1500,     // 0.5 秒延迟
      antiShakeEnabled: true,   // 启用防抖动
      antiShakeThreshold: 50,

      // 对齐吸附配置
      snapEnabled: true,           // 启用对齐
      snapThreshold: 10,           // 吸附阈值 10px
      snapShowLines: true,         // 显示对齐线
      snapToObjects: true,         // 吸附到其他对象
      snapToCenter: true,          // 吸附到中心点
      snapToEdges: true,           // 吸附到边缘
      snapLineColor: '#ff5722',    // 对齐线颜色（橙色）
      snapLineWidth: 1,            // 对齐线宽度
      snapLineDash: [5, 5]         // 虚线样式
    });

    //
    fabricCanvas.originalW = fabricCanvas.width;
    fabricCanvas.originalH = fabricCanvas.height;

    // set up selection style
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerStyle = 'circle';
    fabric.Object.prototype.borderColor = '#C00000';
    fabric.Object.prototype.cornerColor = '#C00000';
    fabric.Object.prototype.cornerStrokeColor = '#FFF';
    fabric.Object.prototype.padding = 0;

    // retrieve active selection to react state
    fabricCanvas.on('selection:created', (e) => this.setActiveSelection(e.target, 'selection:created', e))
    fabricCanvas.on('selection:updated', (e) => this.setActiveSelection(e.target, 'selection:updated', e))
    fabricCanvas.on('selection:cleared', (e) => this.setActiveSelection(null, 'selection:cleared', e))

    // snap to an angle on rotate if shift key is down
    fabricCanvas.on('object:rotating', (e) => {
      if (e.e.shiftKey) {
        e.target.snapAngle = 15;
      } else {
        e.target.snapAngle = false;
      }
    })

    fabricCanvas.on('object:modified', () => {
      console.log('trigger: modified')
      let currentState = this.canvas.toJSON();
      this.history.push(JSON.stringify(currentState));
      //this.setActiveTool('select');
    })

    const savedCanvas = saveInBrowser.load('canvasEditor');
    if (savedCanvas) {
      fabricCanvas.loadFromJSON(savedCanvas, fabricCanvas.renderAll.bind(fabricCanvas));
    }


    // 添加测试对象
    const rect1 = new fabric.Rect({
      left: 100, top: 100,
      width: 100, height: 100,
      fill: '#2196f3',
      hasControls: true
    });

    const rect2 = new fabric.Rect({
      left: 250, top: 200,
      width: 80, height: 80,
      fill: '#4caf50'
    });

    const circle = new fabric.Circle({
      left: 400, top: 150,
      radius: 50,
      fill: '#ff9800'
    });
    //fabricCanvas.add(rect1, rect2, circle);

    var w = fabricCanvas.getWidth();
    var h = fabricCanvas.getHeight();
    $("#canvas_width").val(w);
    $("#canvas_height").val(h);

    // move objects with arrow keys
    (() => document.addEventListener('keydown', (e) => {
      const key = e.which || e.keyCode;
      let activeObject;

      if (document.querySelectorAll('textarea:focus, input:focus').length > 0) return;

      if (key === 37 || key === 38 || key === 39 || key === 40) {
        e.preventDefault();
        activeObject = fabricCanvas.getActiveObject();
        if (!activeObject) {
          return;
        }
      }

      if (key === 37) {
        activeObject.left -= 1;
      } else if (key === 39) {
        activeObject.left += 1;
      } else if (key === 38) {
        activeObject.top -= 1;
      } else if (key === 40) {
        activeObject.top += 1;
      }

      if (key === 37 || key === 38 || key === 39 || key === 40) {
        activeObject.setCoords();
        fabricCanvas.renderAll();
        fabricCanvas.trigger('object:modified');
      }
    }))();

    // delete object on del key
    (() => {
      document.addEventListener('keydown', (e) => {
        const key = e.which || e.keyCode;
        if (
          key === 46 &&
          document.querySelectorAll('textarea:focus, input:focus').length === 0
        ) {

          fabricCanvas.getActiveObjects().forEach(obj => {
            fabricCanvas.remove(obj);
          });

          fabricCanvas.discardActiveObject().requestRenderAll();
          fabricCanvas.trigger('object:modified')
        }
      })
    })();

    setTimeout(() => {
      let currentState = fabricCanvas.toJSON();
      this.history.push(JSON.stringify(currentState));
    }, 1000);

    return fabricCanvas;
    // } catch (_) {
    //   console.error("can't create canvas instance");
    //   return null;
    // }
  }

  window.ImageEditor.prototype.initializeCanvas = canvas;
})();