/**
 * The Core of Image Editor
 */
(function () {
  'use strict';

  // 覆盖原生的 console.log
  const originalLog = console.log;
  console.log = function (...args) {
    const err = new Error();
    const stack = err.stack.split('\n')[2]; // 获取调用者的堆栈
    const match = stack.match(/\((.*):(\d+):\d+\)/) || stack.match(/at (.*):(\d+):\d+/);

    if (match) {
      originalLog(`[${match[1]}:${match[2]}]`, ...args);
    } else {
      originalLog(...args);
    }
    //const stack0 = err.stack.split('\n').slice(2); 
    //originalLog("Stack trace", { stack: stack0 });
  };

  // // 打印调用堆栈的函数
  // printstack = function (title) {
  //   const err = new Error();
  //   const stack = err.stack.split('\n').slice(2); // 获取调用者的堆栈
  //   console.log(title || "Stack trace", { stack: stack });
  // };

  /**
   * Image Editor class
   * @param {String} containerSelector jquery selector for image editor container
   * @param {Array} buttons define toolbar buttons 
   * @param {Array} shapes define shapes
   */
  var ImageEditor = function (containerSelector, buttons, shapes) {
    this.containerSelector = containerSelector;
    this.containerEl = $(containerSelector);

    this.buttons = buttons;
    this.shapes = shapes;

    this.containerEl.addClass('default-container');

    this.canvas = null;
    this.activeTool = null;
    this.activeSelection = null;

    /**
     * Get current state of canvas as object
     * @returns {Object}
     */
    this.getCanvasJSON = () => {
      return this.canvas.toJSON();
    }

    /**
     * Set canvas status by object
     * @param {Object} current the object of fabric canvas status
     */
    this.setCanvasJSON = (current) => {
      current && this.canvas.loadFromJSON(JSON.parse(current), this.canvas.renderAll.bind(this.canvas))
    }

    /**
     * Event handler to set active tool
     * @param {String} id tool id
     */
    this.setActiveTool = (id) => {
      console.log("setActiveTool --, ", id);
      this.activeTool = id;
      $(`${containerSelector} .toolpanel`).removeClass('visible');
      if (id !== 'select' || (id == 'select' && this.activeSelection)) {
        $(`${containerSelector} .toolpanel#${id}-panel`).addClass('visible');
        if (id === 'select') {
          console.log('selection')
          $(`${containerSelector} .toolpanel#${id}-panel`).attr('class', `toolpanel visible type-${this.activeSelection.type}`)
        }
      }

      if (id !== 'select') {
        this.canvas.discardActiveObject();
        this.canvas.renderAll();
        this.activeSelection = null;
      }

      this.canvas.isDrawingLineMode = false;
      this.canvas.isDrawingPathMode = false;
      this.canvas.isDrawingMode = false;
      this.canvas.isDrawingTextMode = false;
      this.canvas.isDrawingCircleMode = false;
      this.canvas.isDrawingQrMode = false;

      this.canvas.defaultCursor = 'default';
      this.canvas.selection = true;
      this.canvas.forEachObject(o => {
        o.selectable = true;
        o.evented = true;
      })

      switch (id) {
        case 'draw':
          this.canvas.isDrawingMode = true;
          break;
        case 'line':
          this.canvas.isDrawingLineMode = true;
          this.canvas.defaultCursor = 'crosshair';
          this.canvas.selection = false;
          this.canvas.forEachObject(o => {
            o.selectable = false,
            o.evented = false
          });
          break;
        case 'circle':
          this.canvas.isDrawingCircleMode = true;
          this.canvas.defaultCursor = 'crosshair';
          this.canvas.selection = false;
          this.canvas.forEachObject(o => {
            o.selectable = false;
            o.evented = false;
          });
          break;
        case 'QRCode':
          this.canvas.isDrawingQrMode = true;
          this.canvas.defaultCursor = 'crosshair';
          this.canvas.selection = false;
          this.canvas.forEachObject(o => {
            o.selectable = false;
            o.evented = false;
          });
          break;
        case 'path':
          this.canvas.isDrawingPathMode = true;
          this.canvas.defaultCursor = 'crosshair';
          this.canvas.selection = false;
          this.canvas.forEachObject(o => {
            o.selectable = false;
            o.evented = false;
          });
          //this.updateTip('Tip: click to place points, press and pull for curves! Click outside or press Esc to cancel!');
          break;
        case 'textbox':
          this.canvas.isDrawingTextMode = true;
          this.canvas.defaultCursor = 'crosshair';
          this.canvas.selection = false;
          this.canvas.forEachObject(o => {
            o.selectable = false;
            o.evented = false;
          });
          break;
        case 'upload':
          this.openDragDropPanel();
          break;
        default:
          //this.updateTip('Tip: hold Shift when drawing a line for 15° angle jumps!');
          break;
      }
      this.activeTool = 'select';
    }

    /**
     * Event handler when perform undo
     */
    this.undo = () => {
      console.log('undo')
      try {
        let undoList = this.history.getValues().undo;
        if (undoList.length) {
          let current = undoList[undoList.length - 1];
          this.history.undo();
          current && this.canvas.loadFromJSON(JSON.parse(current), this.canvas.renderAll.bind(this.canvas))
        }
      } catch (_) {
        console.error("undo failed")
      }
    }

    /**
     * Event handler when perform redo
     */
    this.redo = () => {
      console.log('redo')
      try {
        let redoList = this.history.getValues().redo;
        if (redoList.length) {
          let current = redoList[redoList.length - 1];
          this.history.redo();
          current && this.canvas.loadFromJSON(JSON.parse(current), this.canvas.renderAll.bind(this.canvas))
        }
      } catch (_) {
        console.error("redo failed")
      }
    }

    /**
     * Event handler when select objects on fabric canvas
     * @param {Object} activeSelection fabric js object
     */
    this.setActiveSelection = (activeSelection, title, e) => {
      console.log("setActiveSelection e:", e, ", title:", title, ", activeSelection:", activeSelection);

      var objType = null;
      let activeObjects = this.canvas.getActiveObjects();
      if (activeObjects.length > 0) {
        var obj = activeObjects[0];
        objType = obj.type;
      }
      console.log("setActiveSelection type:", objType);

      // TODO 修改为取对象 CAPS
      switch (objType)
      {
      case null:
        $('#canvas_panel').show();

        $('#position_tools').hide();
        $('#border_tools').hide();
        $('#font_tools').hide();
        $('#align_tools').hide();
        break;
      
      case 'cicle':
      default:
        $('#canvas_panel').hide();

        $('#position_tools').show();
        $('#border_tools').show();
        $('#font_tools').hide();
        $('#align_tools').show();
        break;
      
      case 'textbox':
        $('#canvas_panel').hide();

        $('#position_tools').show();
        $('#border_tools').hide();
        $('#font_tools').show();
        $('#align_tools').show();
        break;
      
      case 'QRCode':
        $('#canvas_panel').hide();

        $('#position_tools').show();
        $('#border_tools').hide();
        $('#font_tools').hide();
        $('#align_tools').show();
        break;
      }

      function updateObjCoordin(obj) {
        if (obj === undefined) return;
        
        $('#angle').val(obj.angle.toFixed(2));
        $('#rect_x0').val(obj.aCoords.tl.x.toFixed(2));
        $('#rect_y0').val(obj.aCoords.tl.y.toFixed(2));
        $('#rect_width0').val((obj.aCoords.br.x - obj.aCoords.tl.x).toFixed(2));
        $('#rect_height0').val((obj.aCoords.br.y - obj.aCoords.tl.y).toFixed(2));

        $('#flip_x0').prop('checked', obj.flipX);
        $('#flip_y0').prop('checked', obj.flipY);
      }
          
      this.canvas.on('object:modified', function (e) {
        var obj = e.target;
        updateObjCoordin(obj);
      });

      if (activeObjects.length == 1) {
        var obj = activeObjects[0];
        updateObjCoordin(obj);
      }

      this.activeSelection = activeSelection;
      this.setActiveTool('select');
    }

    /**
     * Initialize undo/redo stack
     */
    this.configUndoRedoStack = () => {
      this.history = window.UndoRedoStack();
      const ctrZY = (e) => {
        const key = e.which || e.keyCode;

        if (e.ctrlKey && document.querySelectorAll('textarea:focus, input:focus').length === 0) {
          if (key === 90) this.undo()
          if (key === 89) this.redo()
        }
      }
      document.addEventListener('keydown', ctrZY)
    }

    /**
     * Initialize zoom events
     */
    this.initializeZoomEvents = () => {
      this.applyZoom = (zoom) => {
        this.canvas.setZoom(zoom)
        this.canvas.setWidth(this.canvas.originalW * this.canvas.getZoom())
        this.canvas.setHeight(this.canvas.originalH * this.canvas.getZoom())
      }

      // zoom out/in/reset (ctr + -/+/0)
      const keyZoom = (e) => zoomWithKeys(e, this.canvas, this.applyZoom)
      document.addEventListener('keydown', keyZoom)

      // zoom out/in with mouse
      const mouseZoom = (e) => zoomWithMouse(e, this.canvas, this.applyZoom)
      document.addEventListener('wheel', mouseZoom, {
        passive: false
      })
    }

    /**
     * Initialize image editor
     */
    this.init = () => {
      this.configUndoRedoStack();

      this.initializeMainPanel();
      this.initializeToolbar();

      this.initializeShapes();

      //this.initializeFreeDrawSettings();
      //this.initializeCanvasSettingPanel();
      this.initializeSelectionSettings();

      this.canvas = this.initializeCanvas();

      // this.initializeLineDrawing(this.canvas);
      // this.initializePathDrawing(this.canvas);
      // this.initializeTextBoxDrawing(this.canvas);
      // this.initializeCircleDrawing(this.canvas);
      //this.initializeQrDrawing(this.canvas);
      
      this.initializeUpload(this.canvas);
      this.initializeCopyPaste(this.canvas);
      //this.initializeTipSection();
      this.initRuler(this.canvas);

      this.initializeZoomEvents();

      //this.updateCanvasSettings();
      this.extendHideShowToolPanel();
      this.extendNumberInput();
    }

    /**
     * Initialize main panel 
     */
    this.initializeMainPanel = () => {
      $(`${containerSelector}`).append('<div class="main-panel"></div>');
    }

    /**
     * Add features to hide/show tool panel
     */
    this.extendHideShowToolPanel = () => {
      $(`${this.containerSelector} .toolpanel .content`).each(function () {
        $(this).append(`<div class="hide-show-handler"></div>`)
      })

      $(`${this.containerSelector} .toolpanel .content .hide-show-handler`).click(function () {
        let panel = $(this).closest('.toolpanel');
        panel.toggleClass('closed');
      })
    }

    /**
     * Extend custom number input with increase/decrease button
     */
    this.extendNumberInput = () => {
      $(`${containerSelector} .decrease`).click(function () {
        let input = $(this).closest('.custom-number-input').find('input[type=number]')
        let step = input.attr('step');
        if (!step) step = 1;
        else {
          step = parseFloat(step);
        }
        let val = parseFloat(input.val());
        input.val((val - step).toFixed(step.countDecimals()));
        input.change();
      })
      $(`${containerSelector} .increase`).click(function () {
        let input = $(this).closest('.custom-number-input').find('input[type=number]')
        let step = input.attr('step');
        if (!step) step = 1;
        else {
          step = parseFloat(step);
        }
        let val = parseFloat(input.val());
        input.val((val + step).toFixed(step.countDecimals()));
        input.change();
      })
    }

    this.init();
  }

  window.ImageEditor = ImageEditor;
})();