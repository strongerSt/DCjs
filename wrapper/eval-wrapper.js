
/**
 * 简化版Eval解包工具 - 基于GitHub技巧
 */
(function() {
  // 注册插件到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  
  window.DecodePlugins.eval = {
    detect: function(code) {
      // 检测是否为eval包装的代码
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    
    unpack: function(code) {
      console.log("[eval] 尝试检测是否为 eval 加密");
      
      if (!this.detect(code)) {
        console.log("[eval] 不是 eval 加密");
        return null;
      }
      
      console.log("[eval] 检测到 eval 加密，正在解密...");
      const startTime = performance.now();
      
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
          (new Function(code))();
          
          // 如果上面的方法失败，尝试直接执行
          if (!result) {
            eval(code); // 这里会调用我们替换的eval
          }
          
          // 如果仍然没有结果，尝试匹配并手动执行
          if (!result && code.includes('eval(')) {
            const match = code.match(/eval\(([\s\S]+)\)/);
            if (match && match[1]) {
              result = match[1];
            }
          }
        } catch (execError) {
          console.error("[eval] 执行代码错误:", execError);
          
          // 尝试通过正则直接提取
          if (code.includes('eval(')) {
            try {
              const evalPattern = /eval\(([\s\S]+)\)/;
              const match = code.match(evalPattern);
              if (match && match[1]) {
                // 尝试执行提取的代码
                try {
                  result = originalEval(match[1]);
                } catch (innerError) {
                  console.error("[eval] 执行提取代码失败:", innerError);
                }
              }
            } catch (regexError) {
              console.error("[eval] 正则提取失败:", regexError);
            }
          }
        } finally {
          // 恢复原始eval函数
          window.eval = originalEval;
        }
        
        // 递归处理多层加密
        if (result && typeof result === 'string' && result !== code && result.includes('eval(')) {
          console.log("[eval] 检测到多层加密，尝试解开下一层...");
          const nextResult = this.unpack(result);
          if (nextResult && nextResult !== result) {
            result = nextResult;
          }
        }
        
        if (result && typeof result === 'string' && result !== code) {
          const endTime = performance.now();
          console.log(`[eval] eval 解密成功! 耗时: ${(endTime-startTime).toFixed(2)}ms`);
          return result;
        } else {
          console.log("[eval] eval 解密失败或无变化");
          return null;
        }
      } catch (error) {
        console.error("[eval] 整体解密过程错误:", error);
        return null;
      }
    },
    
    pack: function(code) {
      // 简单打包
      return `(function(){${code}})()`;
    }
  };
  
  console.log("简化版Eval解包插件已注册到全局解密插件库");
})();