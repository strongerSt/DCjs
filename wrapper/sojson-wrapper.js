/**
 * JSJiami v6 解密工具包装器 - 将JSJiami v6解密工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始jsjiami-v6-decoder.js插件代码
  // ====== 开始: 原始jsjiami-v6-decoder.js代码 ======
  
  /**
   * 解密由JSJiami v6加密的JavaScript代码
   * @param {string} code - 要解密的代码
   * @returns {string|null} - 解密后的代码或null（解密失败时）
   */
  function plugin(code) {
    try {
      // 检测是否是JSJiami v6加密
      if (!code.includes('_0x') || !code.includes("function _0x")) {
        return null;
      }
      
      // 初始提取解密函数和数据
      let hexArrays = {};
      let shiftFunctions = {};
      
      // 提取所有的十六进制数组定义
      const hexArrayRegex = /var\s+(_0x[a-zA-Z0-9]+)\s*=\s*\[(['"].*?['"](?:\s*,\s*['"].*?['"])*)\];/g;
      let match;
      while ((match = hexArrayRegex.exec(code)) !== null) {
        const arrayName = match[1];
        const arrayContent = match[2];
        try {
          // 转换字符串数组为JavaScript数组
          const arrayStr = `[${arrayContent}]`;
          hexArrays[arrayName] = eval(arrayStr);
        } catch (e) {
          console.error("解析十六进制数组失败:", e);
        }
      }
      
      // 查找并提取shift函数
      const shiftFuncRegex = /function\s+(_0x[a-zA-Z0-9]+)\s*\(\s*(_0x[a-zA-Z0-9]+)(?:\s*,\s*(_0x[a-zA-Z0-9]+))?\s*\)\s*\{\s*(?:.*?\s*)?\1\.push\(\s*\1\.shift\(\)\s*\)/g;
      while ((match = shiftFuncRegex.exec(code)) !== null) {
        const funcName = match[1];
        shiftFunctions[funcName] = true;
      }
      
      // 执行所有的shift函数操作
      for (const funcName in shiftFunctions) {
        if (hexArrays[funcName]) {
          const array = hexArrays[funcName];
          // 模拟数组的shift和push操作
          for (let i = 0; i < array.length; i++) {
            array.push(array.shift());
          }
        }
      }
      
      // 替换所有对十六进制数组的引用
      let decodedCode = code;
      for (const arrayName in hexArrays) {
        const array = hexArrays[arrayName];
        const pattern = new RegExp(`${arrayName}\\[(\\d+)\\]`, 'g');
        decodedCode = decodedCode.replace(pattern, (match, index) => {
          const idx = parseInt(index);
          if (idx >= 0 && idx < array.length) {
            return JSON.stringify(array[idx]);
          }
          return match;
        });
      }
      
      // 处理常见的解码函数
      const decodeRegex = /function\s+(_0x[a-zA-Z0-9]+)\s*\(\s*(_0x[a-zA-Z0-9]+)(?:\s*,\s*[^)]+)?\s*\)\s*\{\s*(?:.*?\s*)?\2\s*=\s*\2\s*-\s*([0-9]+)\s*;/g;
      while ((match = decodeRegex.exec(code)) !== null) {
        const funcName = match[1];
        const offset = parseInt(match[3]);
        
        const funcCallPattern = new RegExp(`${funcName}\\((['"])([^'"]+)\\1\\s*(?:,\\s*([^)]+))?\\)`, 'g');
        decodedCode = decodedCode.replace(funcCallPattern, (match, quote, encoded, param) => {
          try {
            // 简单的字符偏移解码
            let decoded = '';
            for (let i = 0; i < encoded.length; i++) {
              decoded += String.fromCharCode(encoded.charCodeAt(i) - offset);
            }
            return JSON.stringify(decoded);
          } catch (e) {
            return match;
          }
        });
      }
      
      // 移除无用的数组声明和解码函数
      decodedCode = decodedCode.replace(/var\s+_0x[a-zA-Z0-9]+\s*=\s*\[['"].*?['"](,\s*['"].*?['"])*\];/g, '');
      decodedCode = decodedCode.replace(/function\s+_0x[a-zA-Z0-9]+\s*\([^)]*\)\s*\{[^}]*\1\.push\(\s*\1\.shift\(\)\s*\)[^}]*\}/g, '');
      decodedCode = decodedCode.replace(/function\s+_0x[a-zA-Z0-9]+\s*\([^)]*\)\s*\{[^}]*\2\s*=\s*\2\s*-\s*([0-9]+)[^}]*\}/g, '');
      
      // 优化结果，移除多余的空行和注释
      decodedCode = decodedCode.replace(/\/\/.*?(?:\r\n|\n|$)/g, '\n');
      decodedCode = decodedCode.replace(/\/\*[\s\S]*?\*\//g, '');
      decodedCode = decodedCode.replace(/\n\s*\n+/g, '\n\n');
      
      return decodedCode;
    } catch (error) {
      console.error("JSJiami v6 解密发生错误:", error);
      return null;
    }
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始jsjiami-v6-decoder.js代码 ======
  
  // 将插件注册到全局解密插件库（适配DCjs工具格式）
  if (typeof window.plugins === 'undefined') {
    window.plugins = {};
  }
  
  // 注册到DCjs插件系统
  window.plugins["sojson"] = {
    name: "sojson", // 使用sojson名称以匹配工具期望的插件名
    desc: "JSJiami/Sojson v6解密工具",
    // 检测函数
    detect: function(code) {
      return code.includes('function _0x') && code.includes('var _0x') && code.includes('_0x.push(_0x.shift())');
    },
    // 解密函数
    run: function(code) {
      return module.exports.plugin(code) || code;
    }
  };
  
  console.log("JSJiami/Sojson v6 解密插件已加载");
})();
