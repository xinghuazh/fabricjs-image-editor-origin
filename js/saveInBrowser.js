/**
 * Define utils to save/load canvas status with local storage
 */
window.saveInBrowser = {
  saveJSONToFile(filename, data) {
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(data, null, 2);

    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });

    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  save: (name, value) => {
    // if item is an object, stringify
    if (value instanceof Object) {
      value = JSON.stringify(value);
    }

    localStorage.setItem(name, value);
  },
  load: (name) => {
    let value = localStorage.getItem(name);
    value = JSON.parse(value);

    return value;
  },
  remove: (name) => {
    localStorage.removeItem(name);
  }
}