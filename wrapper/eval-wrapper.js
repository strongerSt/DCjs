/**
 * 简化版Eval解包工具包装器
 */
(function() {
  // 创建全局插件注册对象
  window.DecodePlugins = window.DecodePlugins || {};
  
  /**
   * 替换eval调用为捕获函数
   */
  function replaceEval(code) {
    return code.replace(/eval\s*\(/g, '(function(x) { return x; })(');
  }
  
  /**
   * 解包eval加密的代码
   */
  function unpackEval(code) {
    // 如果不含eval，返回null
    if (!code.includes('eval(') && !code.includes('eval (')) {
      return null;
    }
    
    try {
      // 替换eval函数
      const modifiedCode = replaceEval(code);
      
      // 创建简单的沙箱环境
      const sandbox = {
        document: {},
        navigator: { userAgent: "Mozilla/5.0" },
        location: {},
        screen: {}
      };
      
      // 执行代码
      try {
        const func = new Function('document', 'navigator', 'location', 'screen', 
                                 `return ${modifiedCode}`);
        const result = func(sandbox.document, sandbox.navigator, 
                          sandbox.location, sandbox.screen);
        
        // 如果结果是字符串且包含eval，递归解包
        if (typeof result === 'string' && result.includes('eval(')) {
          return unpackEval(result);
        }
        return result;
      } catch (innerError) {
        // 如果执行失败，尝试直接替换eval
        return code.replace(/eval\s*\(/g, '(');
      }
    } catch (error) {
      console.error('Eval解包失败:', error);
      return code;
    }
  }
  
  // 注册插件
  window.DecodePlugins.unpackEval = {
    // 检测函数
    detect: function(code) {
      return code.includes('eval(') || code.includes('eval (');
    },
    
    // 解包函数
    plugin: function(code) {
      console.log("尝试解包Eval编码...");
      const result = unpackEval(code);
      return result !== null ? result : code;
    }
  };
  
  console.log("简化版Eval解包工具已加载");
})();