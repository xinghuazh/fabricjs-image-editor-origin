/**
 * Initialize toolbar
 */
(function () {
  'use strict';
  var defaultButtons = [{
    name: 'select',
    title: 'Select/move object (V)',
    icon: `<svg width="24" height="24" viewBox="0 0 512 512" ><path d="M423.547,323.115l-320-320c-3.051-3.051-7.637-3.947-11.627-2.304s-6.592,5.547-6.592,9.856V480 c0,4.501,2.837,8.533,7.083,10.048c4.224,1.536,8.981,0.192,11.84-3.285l85.205-104.128l56.853,123.179 c1.792,3.883,5.653,6.187,9.685,6.187c1.408,0,2.837-0.277,4.203-0.875l74.667-32c2.645-1.131,4.736-3.285,5.76-5.973 c1.024-2.688,0.939-5.675-0.277-8.299l-57.024-123.52h132.672c4.309,0,8.213-2.603,9.856-6.592 C427.515,330.752,426.598,326.187,423.547,323.115z"></path></svg>`
  }, {
    name: 'line',
    title: 'line',
    icon: `<svg width="24" height="24" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
            <path d="M 3 1 L 26 24 L 24 26 L 1 3 L 3 1 Z"></path>
          </svg>`
  }, {
    name: 'rect',
    title: 'rect',
    icon: `<svg width="24" height="24" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
            <path d="M 0 8 L 0 24 L 24 24 L 25 8 L 0 8 Z" />
          </svg>`
  }, {
    name: 'circle',
    title: 'circle',
    icon: `<svg width="24" height="24" viewBox="0 0 27 27" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12"></circle>
          </svg>`
  }, {
    name: 'text',
    title: 'Text',
    icon: `<svg width="24" height="24" viewBox="0 0 512 512" ><path d="M497,90c8.291,0,15-6.709,15-15V15c0-8.291-6.709-15-15-15h-60c-8.291,0-15,6.709-15,15v15H90V15c0-8.401-6.599-15-15-15 H15C6.599,0,0,6.599,0,15v60c0,8.399,6.599,15,15,15h15v332H15c-8.291,0-15,6.709-15,15v60c0,8.291,6.709,15,15,15h60 c8.291,0,15-6.709,15-15v-15h332v15c0,8.399,6.599,15,15,15h60c8.401,0,15-6.601,15-15v-60c0-8.401-6.599-15-15-15h-15V90H497z  M452,422h-15c-8.401,0-15,6.599-15,15v15H90v-15c0-8.291-6.709-15-15-15H60V90h15c8.401,0,15-6.601,15-15V60h332v15 c0,8.291,6.709,15,15,15h15V422z"></path></g></g><g><g><path d="M361,105H151c-8.291,0-15,6.709-15,15v60c0,6.064,3.647,11.543,9.258,13.857c5.625,2.329,12.056,1.04,16.348-3.252 L187.211,165H226v176.459l-27.48,42.221c-3.062,4.6-3.354,10.518-0.747,15.396S205.463,407,211,407h90 c5.537,0,10.62-3.047,13.228-7.925c2.608-4.878,2.314-10.796-0.747-15.396L286,341.459V165h38.789l25.605,25.605 c4.307,4.307,10.781,5.596,16.348,3.252c5.61-2.314,9.258-7.793,9.258-13.857v-60C376,111.709,369.291,105,361,105z"></path></svg>`
  }, {
    name: 'QRCode',
    title: 'QRCode',
    icon: `<span class="fa fa-qrcode fa-gray icon-2x" aria-hidden="true"></span>`
  }, {
    name: 'shapes',
    title: 'Shapes',
    icon: `<svg width="24" height="24" viewBox="0 0 490.927 490.927" ><path d="M336.738,178.502c-12.645,0-24.852,1.693-36.627,4.582L202.57,11.786c-5.869-10.321-22.84-10.321-28.709,0L2.163,313.311 c-2.906,5.105-2.889,11.385,0.078,16.466c2.953,5.088,8.389,8.216,14.275,8.216l166.314,0.009 c2.818,82.551,70.688,148.88,153.906,148.88c85.012,0,154.19-69.167,154.19-154.186S421.749,178.502,336.738,178.502z  M44.917,304.964l143.299-251.63L331.515,304.97L44.917,304.964z"></path></svg>`
  }, {
    name: 'draw',
    title: 'Free draw',
    icon: `<svg width="24" height="24" viewBox="0 -3 512 512" ><path d="M 497.171875 86.429688 C 506.734375 76.867188 512 64.152344 512 50.628906 C 512 37.105469 506.734375 24.390625 497.171875 14.828125 C 487.609375 5.265625 474.894531 0 461.371094 0 C 447.847656 0 435.132812 5.265625 425.570312 14.828125 L 198.296875 242.105469 L 269.894531 313.703125 Z M 497.171875 86.429688 " style="stroke: none; fill-rule: nonzero; fill: rgb(0, 0, 0); fill-opacity: 1;"></path><path d="M 65.839844 506.65625 C 92.171875 507.21875 130.371094 496.695312 162.925781 459.074219 C 164.984375 456.691406 166.894531 454.285156 168.664062 451.855469 C 179.460938 435.875 184.695312 418.210938 183.855469 400.152344 C 182.945312 380.5625 174.992188 362.324219 161.460938 348.796875 C 150.28125 337.613281 134.722656 331.457031 117.648438 331.457031 C 95.800781 331.457031 73.429688 341.296875 56.277344 358.449219 C 31.574219 383.152344 31.789062 404.234375 31.976562 422.839844 C 32.15625 440.921875 32.316406 456.539062 11.101562 480.644531 L 0 493.257812 C 0 493.257812 26.828125 505.820312 65.839844 506.65625 Z M 65.839844 506.65625 " style="stroke: none; fill-rule: nonzero; fill: rgb(0, 0, 0); fill-opacity: 1;"></path><path d="M 209.980469 373.621094 L 248.496094 335.101562 L 176.894531 263.503906 L 137.238281 303.160156 C 154.691406 306.710938 170.464844 315 182.859375 327.394531 C 195.746094 340.285156 205.003906 356.1875 209.980469 373.621094 Z M 209.980469 373.621094 " style="stroke: none; fill-rule: nonzero; fill: rgb(0, 0, 0); fill-opacity: 1;"></path></svg>`
  }, {
    name: 'path',
    title: 'Connectable lines & curves',
    icon: '<svg width="24" height="24" viewBox="28 55 140 140"><path d="m 28.386086,150.01543 v 43.10301 H 71.489092 V 178.7505 H 120.75466 V 164.38283 H 71.355237 L 71.488872,150.0086 H 57.121421 c 0,-49.247 14.367449,-63.614929 63.633239,-63.614929 v -14.36768 c -63.633239,0 -78.000906,28.735609 -78.000906,77.982609 l -14.367888,0.007 z m 14.367669,28.73507 v -14.36767 h 14.367668 v 14.36767 z" id="path840" style="stroke-width: 0.264583;"></path><path d="m 120.74975,150.00843 v 43.10301 h 43.10301 V 150.0016 l -43.10301,0.007 z m 14.36767,28.73507 v -14.36767 h 14.36767 v 14.36767 z" id="path840-1" style="stroke-width: 0.264583;"></path><path d="m 120.74975,57.658601 v 43.103009 h 43.10301 V 57.651771 l -43.10301,0.007 z m 14.36767,28.73507 v -14.36767 h 14.36767 v 14.36767 z" id="path840-1-0" style="stroke-width: 0.264583;"></path></svg>'
  }, {
    name: 'upload',
    title: 'Upload image',
    icon: `<svg width="24" height="24" viewBox="0 0 512 512" ><path d="M412.907,214.08C398.4,140.693,333.653,85.333,256,85.333c-61.653,0-115.093,34.987-141.867,86.08 C50.027,178.347,0,232.64,0,298.667c0,70.72,57.28,128,128,128h277.333C464.213,426.667,512,378.88,512,320 C512,263.68,468.16,218.027,412.907,214.08z M298.667,277.333v85.333h-85.333v-85.333h-64L256,170.667l106.667,106.667H298.667z"></path></svg>`
  }, {
    name: 'background',
    title: 'Canvas option',
    icon: `<svg width="24" height="24" viewBox="0 0 512 512" ><path d="m499.953125 197.703125-39.351563-8.554687c-3.421874-10.476563-7.660156-20.695313-12.664062-30.539063l21.785156-33.886719c3.890625-6.054687 3.035156-14.003906-2.050781-19.089844l-61.304687-61.304687c-5.085938-5.085937-13.035157-5.941406-19.089844-2.050781l-33.886719 21.785156c-9.84375-5.003906-20.0625-9.242188-30.539063-12.664062l-8.554687-39.351563c-1.527344-7.03125-7.753906-12.046875-14.949219-12.046875h-86.695312c-7.195313 0-13.421875 5.015625-14.949219 12.046875l-8.554687 39.351563c-10.476563 3.421874-20.695313 7.660156-30.539063 12.664062l-33.886719-21.785156c-6.054687-3.890625-14.003906-3.035156-19.089844 2.050781l-61.304687 61.304687c-5.085937 5.085938-5.941406 13.035157-2.050781 19.089844l21.785156 33.886719c-5.003906 9.84375-9.242188 20.0625-12.664062 30.539063l-39.351563 8.554687c-7.03125 1.53125-12.046875 7.753906-12.046875 14.949219v86.695312c0 7.195313 5.015625 13.417969 12.046875 14.949219l39.351563 8.554687c3.421874 10.476563 7.660156 20.695313 12.664062 30.539063l-21.785156 33.886719c-3.890625 6.054687-3.035156 14.003906 2.050781 19.089844l61.304687 61.304687c5.085938 5.085937 13.035157 5.941406 19.089844 2.050781l33.886719-21.785156c9.84375 5.003906 20.0625 9.242188 30.539063 12.664062l8.554687 39.351563c1.527344 7.03125 7.753906 12.046875 14.949219 12.046875h86.695312c7.195313 0 13.421875-5.015625 14.949219-12.046875l8.554687-39.351563c10.476563-3.421874 20.695313-7.660156 30.539063-12.664062l33.886719 21.785156c6.054687 3.890625 14.003906 3.039063 19.089844-2.050781l61.304687-61.304687c5.085937-5.085938 5.941406-13.035157 2.050781-19.089844l-21.785156-33.886719c5.003906-9.84375 9.242188-20.0625 12.664062-30.539063l39.351563-8.554687c7.03125-1.53125 12.046875-7.753906 12.046875-14.949219v-86.695312c0-7.195313-5.015625-13.417969-12.046875-14.949219zm-152.160156 58.296875c0 50.613281-41.179688 91.792969-91.792969 91.792969s-91.792969-41.179688-91.792969-91.792969 41.179688-91.792969 91.792969-91.792969 91.792969 41.179688 91.792969 91.792969zm0 0"></path></svg>`
  }]

  const defaultExtendedButtons = [
    //   {
    //   name: 'undo',
    //   title: 'Undo',
    //   icon: `<svg width="24" height="24" viewBox="0 0 512.011 512.011" ><path d="M511.136,286.255C502.08,194.863,419.84,128.015,328,128.015H192v-80c0-6.144-3.52-11.744-9.056-14.432 c-5.568-2.656-12.128-1.952-16.928,1.92l-160,128C2.208,166.575,0,171.151,0,176.015s2.208,9.44,5.984,12.512l160,128 c2.912,2.304,6.464,3.488,10.016,3.488c2.368,0,4.736-0.512,6.944-1.568c5.536-2.688,9.056-8.288,9.056-14.432v-80h139.392 c41.856,0,80,30.08,84.192,71.712c4.832,47.872-32.704,88.288-79.584,88.288H208c-8.832,0-16,7.168-16,16v64 c0,8.832,7.168,16,16,16h128C438.816,480.015,521.472,391.151,511.136,286.255z"></path></svg>`
    // }, {
    //   name: 'redo',
    //   title: 'Redo',
    //   icon: `<svg width="24" height="24" viewBox="0 0 512.011 512.011" style="transform: scale(-1, 1);"><path d="M511.136,286.255C502.08,194.863,419.84,128.015,328,128.015H192v-80c0-6.144-3.52-11.744-9.056-14.432             c-5.568-2.656-12.128-1.952-16.928,1.92l-160,128C2.208,166.575,0,171.151,0,176.015s2.208,9.44,5.984,12.512l160,128             c2.912,2.304,6.464,3.488,10.016,3.488c2.368,0,4.736-0.512,6.944-1.568c5.536-2.688,9.056-8.288,9.056-14.432v-80h139.392             c41.856,0,80,30.08,84.192,71.712c4.832,47.872-32.704,88.288-79.584,88.288H208c-8.832,0-16,7.168-16,16v64             c0,8.832,7.168,16,16,16h128C438.816,480.015,521.472,391.151,511.136,286.255z"></path></svg>`
    // }, {
    //   name: 'save',
    //   title: 'Save',
    //   icon: `<svg width="24" height="24" viewBox="0 0 490.434 490.433" ><path d="M472.003,58.36l-13.132-11.282c-21.798-18.732-54.554-16.644-73.799,4.697L165.39,295.359l-66.312-57.112 c-21.775-18.753-54.536-16.707-73.804,4.611l-11.611,12.848c-9.416,10.413-14.305,24.149-13.595,38.18 c0.717,14.023,6.973,27.188,17.402,36.6l121.553,111.311c10.524,9.883,24.628,15.037,39.044,14.272 c14.416-0.763,27.894-7.386,37.311-18.329l262.245-304.71c9.162-10.646,13.717-24.494,12.661-38.496 C489.229,80.522,482.655,67.512,472.003,58.36z"></path></svg>`
    // }, {
    //   name: 'download',
    //   title: 'Download',
    //   icon: `<svg width="24" height="24" viewBox="0 0 512.171 512.171" ><path d="M479.046,283.925c-1.664-3.989-5.547-6.592-9.856-6.592H352.305V10.667C352.305,4.779,347.526,0,341.638,0H170.971 c-5.888,0-10.667,4.779-10.667,10.667v266.667H42.971c-4.309,0-8.192,2.603-9.856,6.571c-1.643,3.989-0.747,8.576,2.304,11.627 l212.8,213.504c2.005,2.005,4.715,3.136,7.552,3.136s5.547-1.131,7.552-3.115l213.419-213.504 C479.793,292.501,480.71,287.915,479.046,283.925z"></path></svg>`
    // }, {
    //   name: 'clear',
    //   title: 'Clear',
    //   icon: `<svg width="24" height="24" viewBox="0 0 365.696 365.696"><path d="m243.1875 182.859375 113.132812-113.132813c12.5-12.5 12.5-32.765624 0-45.246093l-15.082031-15.082031c-12.503906-12.503907-32.769531-12.503907-45.25 0l-113.128906 113.128906-113.132813-113.152344c-12.5-12.5-32.765624-12.5-45.246093 0l-15.105469 15.082031c-12.5 12.503907-12.5 32.769531 0 45.25l113.152344 113.152344-113.128906 113.128906c-12.503907 12.503907-12.503907 32.769531 0 45.25l15.082031 15.082031c12.5 12.5 32.765625 12.5 45.246093 0l113.132813-113.132812 113.128906 113.132812c12.503907 12.5 32.769531 12.5 45.25 0l15.082031-15.082031c12.5-12.503906 12.5-32.769531 0-45.25zm0 0"></path></svg>`
    // },
  ]

  var toolbar = function () {
    const _self = this;
    let buttons = [];
    let extendedButtons = [];

    buttons = defaultButtons;
    extendedButtons = defaultExtendedButtons;

    try {
      // main buttons
      (() => {
        // buttons.forEach(item => {
        //   $(`${this.containerSelector} #toolbar .main-buttons`).append(`<button id="${item.name}">${item.icon}</button>`);
        // })
        var html = `<div class="shape_group">`;
        for (var i = 0; i < buttons.length; i++) {
          var item = buttons[i];
          console.log("item--", item);
          html += `
            <div class="tool_button" id="${item.name}" title="${item.title}">
              ${item.icon}
            </div>`;
          if ((i % 3) == 2) {
            html += `
              </div>
              <div class="shape_group">`;
          }
        }
        html += `</div>`;

        //
        $('#tools_left').append(html);

        $(`#tools_left .tool_button`).click(function () {
          var ctrl = $(this);
          console.log("ctrl:", ctrl);
          let id = $(this).attr('id');

          // $(`#tools_left tool_button`).removeClass('active');
          // $(`#tools_left tool_button#${id}`).addClass('active');
          // _self.setActiveTool(id);
          //_self.setActiveTool("select");
          var obj = null;
          const center = _self.canvas.getCenter();
          console.log("id: ", id);
          console.log("center: ", center);
          switch (id) {
          case 'line':
            var pointerPoints = [center.left, center.top, center.left + 100, center.top + 100];
            obj = new fabric.Line(pointerPoints, {
              strokeWidth: 2,
              stroke: '#000000'
            });
            // obj.selectable = false;
            // obj.evented = false;
            // obj.strokeUniform = true;
            break;

          case 'rect':
            obj = new fabric.Rect({
              left: center.left, 
              top: center.top,
              width: 80, 
              height: 80,
              fill: 'transparent',
              strokeWidth: 1,
              stroke: '#000000'
            });
            break;

          case 'circle':
            obj = new fabric.Circle({
              left: center.left, 
              top: center.top,
              radius: 50,
              fill: 'transparent',
              strokeWidth: 1,
              stroke: '#000000',
            });
            break;

          case 'text':
            obj = new fabric.Text('test123456789', {
              left: center.left, 
              top: center.top,
              fontSize: 40,
              fontColor: 'black',
              fill: 'black',
              fontFamily: 'Arial',
            });
            break;

          case 'QRCode':
            obj = new fabric.QRCode(null, {},
              {
                left: center.left, 
                top: center.top,
              });
            obj.selectable = true;
            break;

          default:
            break;
          }

          if (obj !== null) {
            obj.selectable = false;
            obj.evented = false;
            obj.strokeUniform = true;
            
            _self.canvas.add(obj);
            _self.canvas.renderAll()
          }

        })
      })();

      // zoom
      (() => {
        let currentZoomLevel = 1;
        $(`${this.containerSelector}`).append(
          `<div class="floating-zoom-level-container"></div>`
        )
        $(`${this.containerSelector} .floating-zoom-level-container`).append(`
          <label>Zoom</label>
          <select id="input-zoom-level">
            ${[0.05, 0.1, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3].map((item =>
          `<option value="${item}" ${item === currentZoomLevel ? 'selected' : ''}>${item * 100}%</option>`
        ))}
          </select>
        `);
        $(`${this.containerSelector} .floating-zoom-level-container #input-zoom-level`).change(function () {
          let zoom = parseFloat($(this).val());
          typeof _self.applyZoom === 'function' && _self.applyZoom(zoom)
        })
      })();

      // extended buttons
      (() => {
        // extendedButtons.forEach(item => {
        //   $(`${this.containerSelector} #toolbar .extended-buttons`).append(`<button id="${item.name}">${item.icon}</button>`);
        // })
        var html = `<div class="shape_group">`;
        for (var i = 0; i < extendedButtons.length; i++) {
          var item = extendedButtons[i];
          html += `
            <div class="ext_button" id="${item.name}" title="${item.title}">
              ${item.icon}
            </div>`;
          if ((i % 3) == 2) {
            html += `
              </div>
              <div class="shape_group">`;
          }
        }
        html += `</div>`;
        $('#tools_left').append(html);

        $(`#tools_left .ext_button`).click(function () {
          let id = $(this).attr('id');
          switch (id) {
            case 'save':
              //if (window.confirm('The current canvas will be saved in your local! Are you sure?')) {
              if (1) {
                var json = _self.canvas.toJSON();
                const jsonString = JSON.stringify(json);
                console.log(jsonString);

                saveInBrowser.save('canvasEditor', _self.canvas.toJSON());
                saveInBrowser.saveJSONToFile('layout.json', _self.canvas.toJSON());
              }
              break;
            case 'clear':
              if (window.confirm('This will clear the canvas! Are you sure?')) {
                _self.canvas.clear(), saveInBrowser.remove('canvasEditor');
              }
              break;
            case 'download':
              $('body').append(`<div class="custom-modal-container">
              <div class="custom-modal-content">
                <div class="button-download" id="svg">Download as SVG</div>
                <div class="button-download" id="png">Download as PNG</div>
                <div class="button-download" id="jpg">Download as JPG</div>
              </div>
            </div>`);

              $(".custom-modal-container").click(function () {
                $(this).remove();
              });

              $(".custom-modal-container .button-download").click(function (e) {
                let type = $(this).attr('id');
                if (type === 'svg') downloadSVG(_self.canvas.toSVG());
                else if (type === 'png') downloadImage(_self.canvas.toDataURL())
                else if (type === 'jpg') downloadImage(_self.canvas.toDataURL({
                  format: 'jpeg'
                }), 'jpg', 'image/jpeg');
              });
              break;
            case 'undo':
              _self.undo();
              break;
            case 'redo':
              _self.redo();
              break;
          }
        })
      })()


    } catch (_) {
      console.error("can't create toolbar");
    }


    // zoom
    (() => {
      const canvas = _self.canvas;

      // === 工具栏管理 ===
      let toolbarGroup = null;      // 工具栏组
      let currentTarget = null;     // 当前选中的对象

      // 创建工具栏（使用自定义控件而非文本对象）
      function createToolbar(target) {
        // 移除旧工具栏
        if (toolbarGroup) {
          canvas.remove(toolbarGroup);
          toolbarGroup = null;
        }

        currentTarget = target;

        // 获取目标对象的位置
        const bounds = target.getBoundingRect();
        const toolWidth = 240;
        const toolHeight = 44;
        const toolLeft = bounds.left + (bounds.width - toolWidth) / 2;
        const toolTop = bounds.top - 55;

        // 1. 背景面板（可交互区域）
        const panel = new fabric.Rect({
          left: toolLeft,
          top: toolTop,
          width: toolWidth,
          height: toolHeight,
          //fill: 'rgba(0, 0, 0, 0.85)',
          rx: 8,
          ry: 8,
          stroke: '#ddd',
          strokeWidth: 1,
          //shadow: '0 2px 8px rgba(0,0,0,0.3)',
          selectable: false,
          evented: false,  // 让背景不拦截事件
          hasControls: false,
          hasBorders: false
        });

        // 2. 删除按钮（使用矩形 + 文字组合，使其可点击）
        const deleteBtn = new fabric.Rect({
          left: toolLeft + 5,
          top: toolTop + 5,
          width: 60,
          height: 28,
          fill: '#e74c3c',
          rx: 4,
          ry: 4,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        const deleteText = new fabric.Text('🗑️ 删除', {
          left: toolLeft + 5,
          top: toolTop + 5,
          fontSize: 14,
          fill: 'white',
          fontFamily: 'Arial',
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        // 3. 改色按钮
        const colorBtn = new fabric.Rect({
          left: toolLeft + 90,
          top: toolTop + 8,
          width: 60,
          height: 28,
          fill: '#3498db',
          rx: 4,
          ry: 4,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        const colorText = new fabric.Text('🎨 改色', {
          left: toolLeft + 100,
          top: toolTop + 13,
          fontSize: 14,
          fill: 'white',
          fontFamily: 'Arial',
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        // 4. 复制按钮
        const copyBtn = new fabric.Rect({
          left: toolLeft + 165,
          top: toolTop + 8,
          width: 60,
          height: 28,
          fill: '#2ecc71',
          rx: 4,
          ry: 4,
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        const copyText = new fabric.Text('📋 复制', {
          left: toolLeft + 175,
          top: toolTop + 13,
          fontSize: 14,
          fill: 'white',
          fontFamily: 'Arial',
          selectable: false,
          hasControls: false,
          hasBorders: false,
          hoverCursor: 'pointer'
        });

        // 创建工具栏组
        toolbarGroup = new fabric.Group(
          [panel, deleteBtn, deleteText, colorBtn, colorText, copyBtn, copyText],
          {
            selectable: false,
            evented: true,
            hasControls: false,
            hasBorders: false,
            subTargetCheck: true  // 关键！允许检测组内子对象
          }
        );

        // 添加到画布
        canvas.add(toolbarGroup);
        canvas.bringToFront(toolbarGroup);

        // 使用 Fabric.js 的鼠标事件系统（正确的方式）
        canvas.on('mouse:down', onCanvasMouseDown);

        function onCanvasMouseDown(e) {
          if (!toolbarGroup) return;

          const target = e.target;
          if (!target) return;

          // 检查是否点击了删除按钮区域
          if (target === deleteBtn || target === deleteText || target === deleteBtn) {
            e.e.stopPropagation();
            if (currentTarget) {
              canvas.remove(currentTarget);
              // statusDiv.innerHTML = '✅ 已删除对象';
              removeToolbar();
              canvas.discardActiveObject();
              canvas.renderAll();
            }
          }
          // 检查是否点击了改色按钮
          else if (target === colorBtn || target === colorText) {
            e.e.stopPropagation();
            if (currentTarget) {
              const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
              currentTarget.set('fill', randomColor);
              canvas.renderAll();
              // statusDiv.innerHTML = `🎨 颜色已改为 ${randomColor}`;
              // setTimeout(() => {
              //   if (statusDiv) statusDiv.innerHTML = '✅ 就绪，请点击画布上的对象';
              // }, 1500);
            }
          }
          // 检查是否点击了复制按钮
          else if (target === copyBtn || target === copyText) {
            e.e.stopPropagation();
            if (currentTarget) {
              cloneObject(currentTarget);
              // statusDiv.innerHTML = '📋 对象已复制';
              // setTimeout(() => {
              //   if (statusDiv) statusDiv.innerHTML = '✅ 就绪，请点击画布上的对象';
              // }, 1500);
            }
          }
        }

        canvas.renderAll();
      }

      // 复制对象
      function cloneObject(original) {
        return new Promise((resolve) => {
          original.clone((cloned) => {
            cloned.set({
              left: original.left + 30,
              top: original.top + 30,
              evented: true
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();

            // 为新复制的对象创建工具栏
            if (toolbarGroup) {
              canvas.remove(toolbarGroup);
              toolbarGroup = null;
            }
            createToolbar(cloned);
            resolve(cloned);
          });
        });
      }

      // 移除工具栏
      function removeToolbar() {
        if (toolbarGroup) {
          canvas.remove(toolbarGroup);
          toolbarGroup = null;
        }
        //canvas.off('mouse:down', onCanvasMouseDown);
        currentTarget = null;
      }

      // 更新工具栏位置（当对象移动时）
      function updateToolbarPosition(target) {
        if (!toolbarGroup || !target) return;

        const bounds = target.getBoundingRect();
        const toolWidth = 240;
        const toolLeft = bounds.left + (bounds.width - toolWidth) / 2;
        const toolTop = bounds.top - 55;

        // 重新创建工具栏（简单起见，重新创建）
        // 注意：这里简化处理，实际项目中可以只更新位置
        createToolbar(target);
      }

      // === 监听选中事件（Fabric.js 标准事件）===
      canvas.on('selection:created', (e) => {
        if (e.selected && e.selected[0]) {
          createToolbar(e.selected[0]);
          // statusDiv.innerHTML = `✅ 已选中: ${e.selected[0].name || e.selected[0].type}`;
        }
      });

      canvas.on('selection:updated', (e) => {
        if (e.selected && e.selected[0]) {
          // 避免重复创建
          if (currentTarget !== e.selected[0]) {
            createToolbar(e.selected[0]);
            // statusDiv.innerHTML = `✅ 已选中: ${e.selected[0].name || e.selected[0].type}`;
          }
        }
      });

      canvas.on('selection:cleared', () => {
        removeToolbar();
        // statusDiv.innerHTML = '✅ 已取消选中';
      });

      // 对象移动时更新工具栏
      canvas.on('object:moving', (e) => {
        if (toolbarGroup && currentTarget === e.target) {
          updateToolbarPosition(e.target);
        }
      });

      // 对象缩放时也更新
      canvas.on('object:scaling', (e) => {
        if (toolbarGroup && currentTarget === e.target) {
          updateToolbarPosition(e.target);
        }
      });

    })();

  }

  window.ImageEditor.prototype.initializeToolbar = toolbar;
})();