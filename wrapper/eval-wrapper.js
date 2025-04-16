
/**
 * Eval解包打包工具包装器 - 将基于Eval的解包打包工具转换为浏览器可用版本
 */

// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  
  // ====== 开始: 原始eval插件代码 ======
  /**
   * 解码被eval包装的JavaScript代码
   * @param {string} code - 被eval包装的代码
   * @returns {string|null} - 解码后的代码或null（如果解码失败）
   */
  function plugin(code) {
    try {
      // 保存原始eval函数
      const originalEval = window.eval;
      let result = null;
      
      // 替换全局eval函数以捕获代码
      window.eval = function(jsCode) {
        result = jsCode;
        return jsCode;
      };
      
      try {
        // 执行代码，触发我们的替换eval
        new Function(code)();
        
        // 如果上面的方法失败，尝试直接执行
        if (!result) {
          eval(code); // 这里会调用我们替换的eval
        }
        
        // 递归处理多层eval
        if (result && typeof result === 'string' && result.includes('eval(')) {
          // 恢复原始eval
          window.eval = originalEval;
          
          // 递归解密
          const nextResult = plugin(result);
          if (nextResult) {
            result = nextResult;
          }
          
          return result;
        }
      } catch (e) {
        console.error("执行eval代码失败:", e);
        
        // 尝试正则提取法
        try {
          const patterns = [
            /eval\(\s*(function\s*\([^)]*\)\s*\{[\s\S]*?\})\s*\)/i,
            /eval\s*\(\s*(['"])(.*)(\1)\s*\)/i
          ];
          
          for (const pattern of patterns) {
            const match = code.match(pattern);
            if (match) {
              const extracted = match[1] || match[2];
              if (extracted) {
                try {
                  return originalEval(extracted);
                } catch (evalError) {
                  console.error("执行提取代码失败:", evalError);
                }
              }
            }
          }
        } catch (regexError) {
          console.error("正则提取失败:", regexError);
        }
      } finally {
        // 恢复原始eval函数
        window.eval = originalEval;
      }
      
      return result;
    } catch (error) {
      console.error('Eval解码错误:', error);
      return null;
    }
  }

  // 导出plugin函数
  module.exports = plugin;
  // ====== 结束: 原始eval插件代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.eval = {
    detect: function(code) {
      // 检测是否包含eval的特征
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    plugin: function(code) {
      // 调用原始插件函数
      try {
        console.log("[eval] 尝试检测是否为 eval 加密");
        
        if (!this.detect(code)) {
          console.log("[eval] 不是 eval 加密");
          return null;
        }
        
        console.log("[eval] 检测到 eval 加密，正在解密...");
        const startTime = performance.now();
        
        const result = module.exports(code);
        
        if (result && result !== code) {
          const endTime = performance.now();
          console.log(`[eval] eval 解密成功! 耗时: ${(endTime-startTime).toFixed(2)}ms`);
          return result;
        } else {
          console.log("[eval] eval 解密失败或无变化");
          return null;
        }
      } catch (e) {
        console.error("[eval] 插件错误:", e);
        return null;
      }
    }
  };
  
  console.log("Eval解包打包插件已加载");
})();