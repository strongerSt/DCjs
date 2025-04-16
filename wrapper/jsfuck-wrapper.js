/**
 * JSFuck解密工具包装器 - 将JSFuck解密工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始jsfuck.js插件代码
  // ====== 开始: 原始jsfuck.js代码 ======
  
  function plugin(code) {
    try {
      // 检测是否为JSFuck编码
      if (!isJSFuck(code)) {
        return null;
      }
      
      // 删除可能存在的包装函数
      code = code.replace(/^!/, "");
      
      // 对于短JSFuck代码，直接执行解密
      if (code.length < 100000) {
        try {
          return eval(`(${code})`);
        } catch (e) {
          console.error("JSFuck执行错误:", e);
        }
      }
      
      // 对于长代码或执行失败的情况，尝试构建AST解析
      try {
        const ast = window.Babel.parse(code);
        return window.Babel.generator(ast).code;
      } catch (e) {
        console.error("JSFuck AST解析错误:", e);
        return null;
      }
    } catch (e) {
      console.error("JSFuck解密错误:", e);
      return null;
    }
  }
  
  // 检测是否为JSFuck编码
  function isJSFuck(code) {
    // JSFuck编码只包含 []()!+ 字符
    const cleanCode = code.replace(/\s/g, "");
    const jsChars = cleanCode.replace(/[^\[\]\(\)\!\+]/g, "");
    
    // 如果过滤后的长度与原长度相近，且原始代码中包含大量特殊字符，则认为是JSFuck
    return jsChars.length > cleanCode.length * 0.8 && 
           cleanCode.includes("[") && 
           cleanCode.includes("]") && 
           cleanCode.includes("(") && 
           cleanCode.includes(")");
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始jsfuck.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.jsfuck = {
    detect: function(code) {
      // 使用isJSFuck函数检测
      return isJSFuck(code);
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    }
  };
  
  console.log("JSFuck解密插件已加载");
})();
