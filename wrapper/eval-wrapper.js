
/**
 * iframe沙箱版Eval解包工具
 */
(function() {
  // 注册插件到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  
  window.DecodePlugins.eval = {
    detect: function(code) {
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    unpack: function(code) {
      try {
        console.log("[eval] 尝试检测是否为 eval 加密");
        
        if (!this.detect(code)) {
          console.log("[eval] 不是 eval 加密");
          return null;
        }
        
        console.log("[eval] 检测到 eval 加密，正在解密...");
        
        const startTime = performance.now();
        let result = "";
        
        // 创建沙箱 iframe 避免污染主窗口
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const sandbox = iframe.contentWindow;
        
        try {
          // 递归解密最多5层
          let maxLayers = 5;
          let currentLayer = 0;
          let previousCode = code;
          let currentCode = code;
          
          while (currentLayer < maxLayers) {
            // 保存eval原始引用
            const originalEval = sandbox.eval;
            
            // 重写沙箱的eval函数来捕获结果
            sandbox.eval = function(evalCode) {
              result = evalCode;
              return evalCode; // 保持原始行为
            };
            
            // 替换eval为沙箱的eval
            let safeCode = currentCode.replace(/eval\(/g, "window.eval(");
            
            // 执行
            try {
              // 创建一个函数并执行，这样可以处理代码中的return语句
              sandbox.Function(safeCode)();
            } catch (execError) {
              console.error(`[eval] 第${currentLayer+1}层解密执行错误:`, execError);
              
              // 尝试使用直接eval方式
              try {
                sandbox.eval(safeCode);
              } catch (directError) {
                console.error(`[eval] 直接eval解密尝试失败:`, directError);
                break;
              }
            }
            
            // 恢复原始eval
            sandbox.eval = originalEval;
            
            // 检查结果
            if (!result || result === currentCode) {
              // 如果结果没有变化或为空，退出循环
              break;
            }
            
            // 更新代码并继续下一层
            previousCode = currentCode;
            currentCode = result;
            currentLayer++;
            
            console.log(`[eval] 成功解开第 ${currentLayer} 层eval加密`);
            
            // 检查是否还有更多层需要解开
            if (!currentCode.includes('eval(')) {
              break;
            }
          }
          
          if (currentLayer > 0) {
            console.log(`[eval] 总共解开了 ${currentLayer} 层eval加密`);
            const endTime = performance.now();
            console.log(`[eval] eval 解密成功! 耗时: ${(endTime-startTime).toFixed(2)}ms`);
            
            // 清理
            document.body.removeChild(iframe);
            return result;
          } else {
            console.log("[eval] 解密失败，未能解开任何层");
            document.body.removeChild(iframe);
            return null;
          }
        } catch (error) {
          console.error("[eval] 沙箱解密错误:", error);
          document.body.removeChild(iframe);
          return null;
        }
      } catch (outerError) {
        console.error("[eval] 整体解密过程错误:", outerError);
        return null;
      }
    },
    pack: function(code) {
      // 简单打包
      return `(function(){${code}})()`;
    }
  };
  
  console.log("iframe沙箱版Eval解包打包插件已注册到全局解密插件库");
})();