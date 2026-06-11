/**
 * Define action to draw circle by mouse actions
 */
(function () {
  //---------------------------------------------------------------------------
  // 创建半圆类
  fabric.mCBaseShape = fabric.util.createClass(fabric.Object, {
    type: 'mCBaseShape',

    initialize: function (options) {
      console.log("mCBaseShape init, options:", options);
      options || (options = {});

      this.callSuper('initialize', options);
      this.width = 100;
      this.height = 50;
      this.set('label', options.label || '');
    },

    toObject: function () {
      return fabric.util.object.extend(this.callSuper('toObject'), {
        label: this.get('label')
      });
    },

  });

  fabric.mCBaseShape.fromObject = function(object, callback) {
    console.log("mCBaseShape fromObject, options:", object, ", callback:", callback);

    return fabric.Object._fromObject('mCBaseShape', object, callback);
  };

})()