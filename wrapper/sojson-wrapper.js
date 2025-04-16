
/**
 * JSJiami v6解密包装器 - 简化版
 */
(function() {
  // 全局注册对象
  window.DecodePlugins = window.DecodePlugins || {};
  
  // 简化的检测函数
  function detect(code) {
    return code.includes('jsjiami.com.v6') || 
           (code.includes('_0x') && code.includes('var _0x') && 
            !code.includes('jsjiami.com.v7'));
  }
  
  // 简化的解密函数
  function plugin(code) {
    try {
      // 如果不是JSJiami v6编码，返回原始代码
      if (!detect(code)) {
        return code;
      }
      
      // 去除特征标记
      code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v6[\s\S]*?\*\//g, "");
      code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v6.*$/gm, "");
      
      // 查找字符串数组并替换
      var arrayRegex = /var\s+(_0x[a-f0-9]{4,})\s*=\s*\[\s*([^\]]*)\s*\]/g;
      var match;
      
      while ((match = arrayRegex.exec(code)) !== null) {
        try {
          var arrayName = match[1];
          var arrayContent = match[2];
          var arrayStr = "[" + arrayContent + "]";
          var array = new Function("return " + arrayStr)();
          
          // 替换简单引用
          for (var i = 0; i < array.length; i++) {
            var pattern = new RegExp(arrayName + "\\[" + i + "\\]", "g");
            if (typeof array[i] === 'string') {
              code = code.replace(pattern, "'" + array[i].replace(/'/g, "\\'") + "'");
            }
          }
        } catch (e) {
          // 忽略错误，继续处理
        }
      }
      
      return code;
    } catch (e) {
      console.error("JSJiami v6解密错误:", e);
      return code; // 出错时返回原始代码
    }
  }
  
  // 注册插件
  window.DecodePlugins.jsjiamiV6 = {
    detect: detect,
    plugin: plugin
  };
  
  console.log("JSJiami v6解密插件(简化版)已加载");
})();
