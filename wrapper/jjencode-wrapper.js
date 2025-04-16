/**
 * JJEncode解密工具包装器 - 将JJEncode解密工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始jjencode.js插件代码
  // ====== 开始: 原始jjencode.js代码 ======
  
  function plugin(code) {
    try {
      // 检测是否为JJEncode编码
      if (!isJJEncode(code)) {
        return null;
      }
      
      // 提取头部注释
      const headerMatch = code.match(/^([\s\S]*?)\$.*=/m);
      const header = headerMatch ? headerMatch[1] : '';
      
      // 尝试通过eval执行来解密
      try {
        // 创建一个安全的执行上下文
        const sandbox = {
          result: null,
          window: {},
          document: {},
          location: {}
        };
        
        // 包装代码以捕获结果
        const wrappedCode = `
          try {
            ${code};
            if (typeof _JJ_CODE !== 'undefined') {
              result = _JJ_CODE;
            }
          } catch(e) {
            console.error("JJEncode执行错误:", e);
          }
        `;
        
        // 执行代码
        (new Function('result', 'window', 'document', 'location', wrappedCode))
          .call(sandbox, sandbox.result, sandbox.window, sandbox.document, sandbox.location);
        
        // 如果获取到了结果
        if (sandbox.result) {
          // 如果有头部注释，添加回去
          return header ? `${header}\n\n${sandbox.result}` : sandbox.result;
        }
        
        // 如果没有获取到_JJ_CODE变量，尝试直接执行
        return header ? `${header}\n\n${eval(code)}` : eval(code);
      } catch (e) {
        console.error("JJEncode解密错误:", e);
        
        // 如果执行失败，尝试提取可能的代码片段
        const extractedCode = extractJJCode(code);
        return extractedCode ? (header ? `${header}\n\n${extractedCode}` : extractedCode) : null;
      }
    } catch (e) {
      console.error("JJEncode处理错误:", e);
      return null;
    }
  }
  
  // 检测是否为JJEncode编码
  function isJJEncode(code) {
    // JJEncode的特征包括$和_字符的大量使用，以及特定模式
    return code.includes('$=~[];$={___:++$') || 
           code.includes(';;;;;;') ||
           code.includes('$={___:++$') ||
           code.includes('$._$_') ||
           (code.includes('$$$$') && code.includes('_$'));
  }
  
  // 尝试从JJEncode中提取可能的代码
  function extractJJCode(code) {
    // 寻找可能的结束点
    const endPatterns = [
      /\);/g,
      /\)\(\);/g,
      /\$\$\(\);/g
    ];
    
    for (const pattern of endPatterns) {
      const matches = [...code.matchAll(pattern)];
      if (matches.length > 0) {
        // 获取最后一个匹配的位置
        const lastMatch = matches[matches.length - 1];
        const endPos = lastMatch.index + lastMatch[0].length;
        
        // 尝试执行到这个位置的代码
        try {
          return eval(code.substring(0, endPos));
        } catch (e) {
          // 继续尝试下一个模式
          continue;
        }
      }
    }
    
    return null;
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始jjencode.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.jjencode = {
    detect: function(code) {
      // 使用isJJEncode函数检测
      return isJJEncode(code);
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    }
  };
  
  console.log("JJEncode解密插件已加载");
})();
