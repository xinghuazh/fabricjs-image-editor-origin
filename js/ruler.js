/**
 * Define actions to manage tip section
 */
(function () {
  'use strict';

  class DynamicRulerManager {
    constructor(mainCanvas, options) {
      this.mainCanvas = mainCanvas;           // fabric.Canvas 实例
      this.container = options.container;     // 容器元素
      this.rulerSize = options.rulerSize || 20; // 标尺宽/高

      // 当前视口状态
      this.currentZoom = 1;                    // 当前缩放比例
      this.currentPanX = 0;                   // 当前水平偏移（像素）
      this.currentPanY = 0;                   // 当前垂直偏移（像素）

      // 刻度配置
      this.minStep = 5;                        // 最小刻度间隔（像素）
      this.maxStep = 200;                      // 最大刻度间隔（像素）
      this.baseSteps = [1, 2, 5, 10, 20, 50, 100, 200, 500]; // 可选步长

      // 创建静态画布用于标尺
      this.staticCanvas = new fabric.StaticCanvas('ruler-canvas', {
        width: mainCanvas.width + this.rulerSize,
        height: mainCanvas.height + this.rulerSize,
        backgroundColor: '#f0f0f0'
      });

      // 绑定事件
      this._bindEvents();

      // 初始绘制
      this.draw();
    }

    /**
     * 绑定 Fabric 画布事件
     */
    _bindEvents() {
      // 监听滚轮缩放
      this.mainCanvas.on('mouse:wheel', this._onWheel.bind(this));

      // 监听画布移动（如果支持 pan）
      this.mainCanvas.on('moving', this._onPan.bind(this));

      // 监听对象移动/缩放后的重绘
      this.mainCanvas.on('object:moving', () => this.draw());
      this.mainCanvas.on('object:scaling', () => this.draw());

      // 监听画布渲染完成事件，确保标尺在最上层
      this.mainCanvas.on('after:render', () => {
        if (this.staticCanvas) {
          this.staticCanvas.renderAll();
        }
      });
    }

    /**
     * 鼠标滚轮事件处理
     */
    _onWheel(opt) {
      const delta = opt.e.deltaY > 0 ? 0.95 : 1.05;
      const newZoom = Math.max(0.1, Math.min(10, this.currentZoom * delta));

      if (newZoom !== this.currentZoom) {
        this.currentZoom = newZoom;

        // 获取鼠标位置作为缩放中心
        const pointer = this.mainCanvas.getPointer(opt.e);
        const zoomPoint = {
          x: pointer.x,
          y: pointer.y
        };

        // 应用缩放
        this.mainCanvas.setZoom(this.currentZoom);

        // 重新计算偏移（保持鼠标位置不变）
        this._recalculatePanAfterZoom(zoomPoint, delta);

        // 重绘标尺
        this.draw();
      }

      opt.e.preventDefault();
      opt.e.stopPropagation();
    }

    /**
     * 缩放后重新计算偏移，保持鼠标位置不变
     */
    _recalculatePanAfterZoom(zoomPoint, delta) {
      const oldZoom = this.currentZoom / (delta > 1 ? 1.05 : 0.95);
      const vpt = this.mainCanvas.viewportTransform;
      if (vpt) {
        // 计算新的偏移量
        const newX = zoomPoint.x - (zoomPoint.x - vpt[4]) * (this.currentZoom / oldZoom);
        const newY = zoomPoint.y - (zoomPoint.y - vpt[5]) * (this.currentZoom / oldZoom);

        vpt[4] = newX;
        vpt[5] = newY;
        this.mainCanvas.setViewportTransform(vpt);

        this.currentPanX = vpt[4];
        this.currentPanY = vpt[5];
      }
    }

    /**
     * 画布平移事件处理
     */
    _onPan(opt) {
      const vpt = this.mainCanvas.viewportTransform;
      if (vpt) {
        this.currentPanX = vpt[4];
        this.currentPanY = vpt[5];
        this.draw();  // 平移时重绘标尺
      }
    }

    /**
     * 动态计算刻度步长（根据当前缩放级别）
     */
    _calculateStep() {
      // 计算在屏幕上每个像素对应的实际单位（这里简化为像素）
      // 实际步长 = 基础步长 / 当前缩放
      const zoom = this.currentZoom;

      // 目标：让刻度线在屏幕上的间隔保持在 30-80 像素之间
      const targetScreenStep = 50;  // 目标屏幕间隔（像素）
      const idealWorldStep = targetScreenStep / zoom;

      // 从预定义步长中选择最接近的
      let bestStep = this.baseSteps[0];
      let minDiff = Math.abs(idealWorldStep - bestStep);

      for (const step of this.baseSteps) {
        const diff = Math.abs(idealWorldStep - step);
        if (diff < minDiff) {
          minDiff = diff;
          bestStep = step;
        }
      }

      // 限制步长范围
      return Math.max(this.minStep, Math.min(this.maxStep, bestStep));
    }

    /**
     * 计算世界坐标对应的屏幕坐标
     */
    _worldToScreen(worldX, worldY) {
      // 应用缩放和偏移
      const screenX = worldX * this.currentZoom + this.currentPanX + this.rulerSize;
      const screenY = worldY * this.currentZoom + this.currentPanY + this.rulerSize;
      return { x: screenX, y: screenY };
    }

    /**
     * 绘制双向标尺（主函数）
     */
    draw() {
      if (!this.staticCanvas) return;

      const width = this.mainCanvas.width;
      const height = this.mainCanvas.height;
      const step = this._calculateStep();

      // 清空画布
      this.staticCanvas.clear();

      // 设置背景色
      this.staticCanvas.setBackgroundColor('#f0f0f0', () => { });

      // 绘制边框
      this._drawBorders(width, height);

      // 绘制水平标尺
      this._drawHorizontalRuler(width, step);

      // 绘制垂直标尺
      this._drawVerticalRuler(height, step);

      // 绘制交叉点（标尺角落）
      this._drawRulerCorner();

      this.mainCanvas.renderAll();
      this.staticCanvas.renderAll();
    }

    /**
     * 绘制边框
     */
    _drawBorders(width, height) {
      // 水平标尺底部边框
      this.staticCanvas.add(new fabric.Line(
        [this.rulerSize, this.rulerSize, width + this.rulerSize, this.rulerSize],
        { stroke: '#999', strokeWidth: 1, selectable: false, evented: false }
      ));

      // 垂直标尺右侧边框
      this.staticCanvas.add(new fabric.Line(
        [this.rulerSize, this.rulerSize, this.rulerSize, height + this.rulerSize],
        { stroke: '#999', strokeWidth: 1, selectable: false, evented: false }
      ));
    }

    /**
     * 绘制水平标尺
     */
    _drawHorizontalRuler(width, step) {
      // 计算起始和结束的世界坐标范围
      const startWorldX = Math.floor((-this.currentPanX) / this.currentZoom / step) * step;
      const endWorldX = startWorldX + Math.ceil(width / this.currentZoom / step) * step + step;

      for (let worldX = startWorldX; worldX <= endWorldX; worldX += step) {
        const screenX = worldX * this.currentZoom + this.currentPanX + this.rulerSize;

        // 只绘制在可视区域内的刻度
        if (screenX < this.rulerSize || screenX > width + this.rulerSize) continue;

        // 判断是否为主刻度（步长的倍数）
        const isMajor = Math.abs(worldX) % (step * 5) === 0;
        const tickLength = isMajor ? 10 : 5;

        // 绘制刻度线
        this.staticCanvas.add(new fabric.Line(
          [screenX, this.rulerSize, screenX, this.rulerSize - tickLength],
          { stroke: '#666', strokeWidth: 1, selectable: false, evented: false }
        ));

        // 绘制数字（仅主刻度）
        if (isMajor && worldX !== 0) {
          const text = new fabric.Text(Math.round(worldX).toString(), {
            left: screenX - 6,
            top: this.rulerSize - 18,
            fontSize: 10,
            fontFamily: 'Arial',
            fill: '#333',
            selectable: false,
            evented: false
          });
          this.staticCanvas.add(text);
        } else if (worldX === 0) {
          // 零点特殊标记
          const zeroMark = new fabric.Triangle({
            left: screenX - 3,
            top: this.rulerSize - 12,
            width: 6,
            height: 6,
            fill: '#e74c3c',
            selectable: false,
            evented: false
          });
          this.staticCanvas.add(zeroMark);
        }
      }
    }

    /**
     * 绘制垂直标尺
     */
    _drawVerticalRuler(height, step) {
      // 计算起始和结束的世界坐标范围
      const startWorldY = Math.floor((-this.currentPanY) / this.currentZoom / step) * step;
      const endWorldY = startWorldY + Math.ceil(height / this.currentZoom / step) * step + step;

      for (let worldY = startWorldY; worldY <= endWorldY; worldY += step) {
        const screenY = worldY * this.currentZoom + this.currentPanY + this.rulerSize;

        // 只绘制在可视区域内的刻度
        if (screenY < this.rulerSize || screenY > height + this.rulerSize) continue;

        // 判断是否为主刻度
        const isMajor = Math.abs(worldY) % (step * 5) === 0;
        const tickLength = isMajor ? 10 : 5;

        // 绘制刻度线
        this.staticCanvas.add(new fabric.Line(
          [this.rulerSize, screenY, this.rulerSize - tickLength, screenY],
          { stroke: '#666', strokeWidth: 1, selectable: false, evented: false }
        ));

        // 绘制数字（仅主刻度）
        if (isMajor && worldY !== 0) {
          const text = new fabric.Text(Math.round(worldY).toString(), {
            left: 4,
            top: screenY - 6,
            fontSize: 10,
            fontFamily: 'Arial',
            fill: '#333',
            selectable: false,
            evented: false
          });
          this.staticCanvas.add(text);
        } else if (worldY === 0) {
          // 零点特殊标记
          const zeroMark = new fabric.Triangle({
            left: this.rulerSize - 8,
            top: screenY - 3,
            width: 6,
            height: 6,
            angle: 270,
            fill: '#e74c3c',
            selectable: false,
            evented: false
          });
          this.staticCanvas.add(zeroMark);
        }
      }
    }

    /**
     * 绘制标尺交叉点（左上角）
     */
    _drawRulerCorner() {
      // 绘制角落背景
      this.staticCanvas.add(new fabric.Rect({
        left: 0,
        top: 0,
        width: this.rulerSize,
        height: this.rulerSize,
        fill: '#e8e8e8',
        selectable: false,
        evented: false
      }));

      // 添加交叉装饰
      this.staticCanvas.add(new fabric.Line(
        [0, this.rulerSize, this.rulerSize, 0],
        { stroke: '#ccc', strokeWidth: 1, selectable: false, evented: false }
      ));
    }

    /**
     * 设置缩放级别（外部调用）
     */
    setZoom(zoom) {
      this.currentZoom = Math.max(0.1, Math.min(10, zoom));
      this.mainCanvas.setZoom(this.currentZoom);
      this.draw();
    }

    /**
     * 获取当前缩放级别
     */
    getZoom() {
      return this.currentZoom;
    }

    /**
     * 重置视图
     */
    resetView() {
      this.currentZoom = 1;
      this.currentPanX = 0;
      this.currentPanY = 0;

      const vpt = this.mainCanvas.viewportTransform;
      if (vpt) {
        vpt[4] = 0;
        vpt[5] = 0;
        this.mainCanvas.setViewportTransform(vpt);
      }
      this.mainCanvas.setZoom(1);
      this.draw();
    }

    /**
     * 调整画布尺寸
     */
    resize(width, height) {
      this.mainCanvas.setWidth(width);
      this.mainCanvas.setHeight(height);
      this.staticCanvas.setWidth(width + this.rulerSize);
      this.staticCanvas.setHeight(height + this.rulerSize);
      this.draw();
    }

    /**
     * 销毁管理器
     */
    destroy() {
      if (this.staticCanvas) {
        this.staticCanvas.dispose();
        this.staticCanvas = null;
      }
      // 移除事件监听（Fabric 会自动清理）
    }
  }

  //---------------------------------------------------------------------------
  function initRuler(canvas) {
    return;

    // 创建标尺管理器
    const ruler = new DynamicRulerManager(canvas, {
      container: document.querySelector('.canvas-wrapper'),
      rulerSize: 20
    });

    // 显示当前缩放
    function updateZoomDisplay() {
      //document.getElementById('zoomValue').innerText = Math.round(ruler.getZoom() * 100);
    }

    // 监听缩放事件
    // canvas.on('mouse:wheel', () => {
    //   setTimeout(updateZoomDisplay, 50);
    // });

    // 重置视图按钮
    // document.getElementById('resetView').addEventListener('click', () => {
    //   ruler.resetView();
    //   updateZoomDisplay();
    // });

  }

  window.ImageEditor.prototype.initRuler = initRuler;
})();