/**
 * Eval解包工具包装器 - 将Node.js的Eval解包模块转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始unpack-eval.js插件代码
  // ====== 开始: 原始unpack-eval.js代码 ======
  
  /**
   * 替换代码中的 eval 函数调用，捕获其参数
   * @param {string} code - 包含 eval 调用的代码
   * @returns {string} - 修改后的代码
   */
  function replaceEvalWithCapture(code) {
    // 捕获 eval 的参数并返回它，而不是执行它
    return code.replace(/eval\s*\(/g, '(function(x) { return x; })(');
  }
  
  /**
   * 创建模拟的浏览器环境
   * @returns {Object} - 模拟的浏览器对象
   */
  function createMockBrowser() {
    return {
      window: {
        document: { createElement: () => ({}), addEventListener: () => {} },
        navigator: { userAgent: "Mozilla/5.0" },
        location: { href: "https://example.com" },
        screen: { width: 1920, height: 1080 },
        $response: {}, $request: {}, $done: () => {}, $notify: () => {}
      },
      document: { createElement: () => ({}), addEventListener: () => {} },
      navigator: { userAgent: "Mozilla/5.0" },
      location: { href: "https://example.com" },
      screen: { width: 1920, height: 1080 },
      console: { log: () => {}, error: () => {}, warn: () => {} },
      $response: {}, $request: {}, $done: () => {}, $notify: () => {}
    };
  }
  
  /**
   * 解包 eval 加密的代码
   * @param {string} code - 要解包的代码
   * @returns {string|null} - 解包后的代码或null（解包失败时）
   */
  function unpack(code) {
    // 如果不包含 eval，直接返回
    if (!code.includes('eval(') && !code.includes('eval (')) {
      return null;
    }
    
    try {
      // 替换 eval 为一个捕获函数
      const modifiedCode = replaceEvalWithCapture(code);
      
      // 浏览器环境
      const mockEnv = createMockBrowser();
      
      // 使用 Function 构造函数创建一个函数并执行
      // 传入所有必要的全局变量
      const funcParams = ['window', 'document', 'navigator', 'location', 
                          '$response', '$request', '$notify', '$done'];
      const funcArgs = [
        mockEnv.window, mockEnv.document, mockEnv.navigator, mockEnv.location,
        mockEnv.$response, mockEnv.$request, mockEnv.$notify, mockEnv.$done
      ];
      
      // 创建并执行函数
      const func = new Function(...funcParams, `return ${modifiedCode}`);
      const result = func(...funcArgs);
      
      // 递归解包多层加密
      if (typeof result === 'string' && result.includes('eval(')) {
        return unpack(result);
      }
      return result;
    } catch (error) {
      console.error('解包错误:', error);
      // 在出错的情况下，尝试更直接的方法
      try {
        // 简单地替换 eval 并执行
        const simpleReplaced = code.replace(/eval\s*\(/g, '(');
        return simpleReplaced;
      } catch (e) {
        console.error('备选解包方法也失败:', e);
        return null;
      }
    }
  }
  
  // 导出插件接口
  exports.plugin = unpack;
  exports.unpack = unpack;
  
  // ====== 结束: 原始unpack-eval.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.unpackEval = {
    detect: function(code) {
      // 检测是否包含eval调用
      return code.includes('eval(') || code.includes('eval (');
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    },
    unpack: function(code) {
      // 使用原始模块的unpack方法
      return module.exports.unpack(code);
    }
  };
  
  console.log("Eval解包工具已加载");
})();