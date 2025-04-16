
/**
 * Eval解密插件包装器 - 可同时在Node.js和浏览器环境中使用
 */

// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  
  // ====== 开始: eval解密插件代码 ======
  
  /**
   * 替换代码中的eval函数调用，捕获其参数
   * @param {string} code - 包含eval调用的代码
   * @returns {string} - 修改后的代码
   */
  function replaceEvalWithCapture(code) {
    // 捕获eval的参数并返回它，而不是执行它
    return code.replace(/eval\s*\(/g, '(function(x) { return x; })(');
  }
  
  /**
   * 创建模拟的执行环境
   * @returns {Object} - 模拟的环境对象
   */
  function createMockEnvironment() {
    // 创建基本的模拟对象
    return {
      window: {
        document: { createElement: () => ({}), addEventListener: () => {} },
        navigator: { userAgent: "Mozilla/5.0" },
        location: { href: "https://example.com" },
        screen: { width: 1920, height: 1080 }
      },
      document: { createElement: () => ({}), addEventListener: () => {} },
      navigator: { userAgent: "Mozilla/5.0" },
      location: { href: "https://example.com" },
      screen: { width: 1920, height: 1080 },
      console: { log: () => {}, error: () => {}, warn: () => {} },
      // Quantumult X 相关变量
      $response: {}, 
      $request: {}, 
      $done: () => {}, 
      $notify: () => {}
    };
  }
  
  /**
   * 解包eval加密的JavaScript代码
   * @param {string} code - 要解包的代码
   * @returns {string|null} - 解包后的代码或null（解包失败时）
   */
  function unpack(code) {
    // 检查代码是否包含eval调用
    if (!code.includes('eval(') && !code.includes('eval (')) {
      return null;
    }
    
    try {
      // 替换eval调用为捕获函数
      const modifiedCode = replaceEvalWithCapture(code);
      
      // 创建执行环境
      const mockEnv = createMockEnvironment();
      
      // 创建函数并执行解密
      const funcParams = ['window', 'document', 'navigator', 'location', 
                       '$response', '$request', '$notify', '$done'];
      const funcArgs = [
        mockEnv.window, mockEnv.document, mockEnv.navigator, mockEnv.location,
        mockEnv.$response, mockEnv.$request, mockEnv.$notify, mockEnv.$done
      ];
      
      // 创建函数并执行代码
      const func = new Function(...funcParams, `return ${modifiedCode}`);
      let result = func(...funcArgs);
      
      // 处理多层eval加密
      if (typeof result === 'string' && result.includes('eval(')) {
        return unpack(result); // 递归解包
      }
      
      // 返回解密结果
      return result;
    } catch (error) {
      console.error('Eval解包错误:', error);
      
      // 在出错的情况下，尝试更简单的方法
      try {
        // 直接替换eval函数调用
        return code.replace(/eval\s*\(/g, '(');
      } catch (e) {
        console.error('备选解包方法也失败:', e);
        return null;
      }
    }
  }
  
  // 导出解密函数
  module.exports = unpack;
  // ====== 结束: eval解密插件代码 ======
  
  // 将插件注册到全局解密插件库
  if (typeof window !== 'undefined') {
    window.DecodePlugins = window.DecodePlugins || {};
    window.DecodePlugins.eval = {
      detect: function(code) {
        // 检测是否包含eval加密的特征
        return code.includes('eval(') || code.includes('eval (');
      },
      plugin: function(code) {
        // 调用原始插件函数
        try {
          console.log("尝试解密Eval加密代码...");
          const result = module.exports(code);
          
          // 如果解密失败，返回原始代码；否则返回解密后的结果
          return result !== null ? result : code;
        } catch (e) {
          console.error("Eval解密插件错误:", e);
          return code;
        }
      }
    };
    console.log("Eval解密插件已加载");
  }
  
  // 支持Node.js的CommonJS导出
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      unpack: unpack,
      plugin: unpack
    };
  }
})();