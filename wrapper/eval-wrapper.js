
/**
 * 增强型Eval解包工具 - 多种解密方法组合
 */
(function() {
  // 注册插件到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  
  window.DecodePlugins.eval = {
    detect: function(code) {
      // 更精确的检测模式
      const evalPatterns = [
        /eval\s*\(/i,
        /^[\s\n]*\(function\s*\(\s*\)/i,
        /\beval\s*\(\s*function\s*\(/i,
        /function\s*\(\s*\)\s*\{\s*return/i,
        /\(\s*function\s*\(\s*[a-zA-Z0-9_$,\s]*\)\s*\{[\s\S]*\}\s*\)\s*\(\s*\)/
      ];
      
      return evalPatterns.some(pattern => pattern.test(code));
    },
    
    unpack: function(code) {
      console.log("[eval] 尝试检测是否为 eval 加密");
      
      if (!this.detect(code)) {
        console.log("[eval] 不是 eval 加密");
        return null;
      }
      
      console.log("[eval] 检测到 eval 加密，正在解密...");
      const startTime = performance.now();
      
      // 尝试所有解密方法，直到成功
      let result = null;
      
      // 方法1: iframe沙箱方法
      if (!result) {
        result = this.iframeUnpack(code);
      }
      
      // 方法2: 正则提取并直接执行方法
      if (!result) {
        result = this.regexUnpack(code);
      }
      
      // 方法3: 自执行函数转换方法
      if (!result) {
        result = this.functionUnpack(code);
      }
      
      // 方法4: 模拟执行方法
      if (!result) {
        result = this.simulatedUnpack(code);
      }
      
      if (result && result !== code) {
        const endTime = performance.now();
        console.log(`[eval] eval 解密成功! 耗时: ${(endTime-startTime).toFixed(2)}ms`);
        return result;
      } else {
        console.log("[eval] eval 解密失败或无变化");
        return null;
      }
    },
    
    // 方法1: iframe沙箱解密
    iframeUnpack: function(code) {
      try {
        console.log("[eval] 尝试使用iframe沙箱方法解密...");
        
        // 创建沙箱
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);
        const sandbox = iframe.contentWindow;
        
        try {
          // 记录结果
          let result = "";
          
          // 捕获eval结果
          sandbox.eval = function(evalCode) {
            result = evalCode;
            return evalCode;
          };
          
          // 替换eval
          const safeCode = code.replace(/eval\(/g, "window.eval(");
          
          // 尝试执行
          try {
            sandbox.Function(safeCode)();
          } catch (execError) {
            try {
              sandbox.eval(safeCode);
            } catch (directError) {
              console.log("[eval] iframe沙箱方法失败");
              document.body.removeChild(iframe);
              return null;
            }
          }
          
          document.body.removeChild(iframe);
          
          if (result && result !== code) {
            console.log("[eval] iframe沙箱方法成功");
            return result;
          }
          
          return null;
        } catch (error) {
          console.error("[eval] 沙箱解密错误:", error);
          document.body.removeChild(iframe);
          return null;
        }
      } catch (outerError) {
        console.error("[eval] iframe创建错误:", outerError);
        return null;
      }
    },
    
    // 方法2: 正则提取法
    regexUnpack: function(code) {
      try {
        console.log("[eval] 尝试使用正则提取方法解密...");
        
        // 多种正则模式匹配不同的eval包裹方式
        const patterns = [
          // 标准eval包裹
          /eval\(\s*(function\s*\([^)]*\)\s*\{[\s\S]*?\})\s*\)/i,
          
          // 自执行函数包裹
          /\(\s*(function\s*\([^)]*\)\s*\{[\s\S]*\})\s*\)\s*\(\s*\)/i,
          
          // eval内嵌形式
          /eval\('(.*)'\)/i,
          
          // eval内部函数返回形式
          /eval\(function\s*\([^)]*\)\s*\{.*return\s+(.*);?\s*\}\)/i
        ];
        
        for (const pattern of patterns) {
          const match = code.match(pattern);
          if (match && match[1]) {
            try {
              // 尝试执行提取的代码
              let extractedCode = match[1];
              
              // 如果是函数定义，尝试自执行
              if (extractedCode.trim().startsWith('function')) {
                extractedCode = `(${extractedCode})()`;
              }
              
              const result = eval(extractedCode);
              
              if (result && typeof result === 'string' && result !== code) {
                console.log("[eval] 正则提取方法成功");
                return result;
              }
            } catch (evalError) {
              console.error("[eval] 正则提取的代码执行失败:", evalError);
            }
          }
        }
        
        console.log("[eval] 正则提取方法失败");
        return null;
      } catch (error) {
        console.error("[eval] 正则提取解密错误:", error);
        return null;
      }
    },
    
    // 方法3: 函数转换法
    functionUnpack: function(code) {
      try {
        console.log("[eval] 尝试使用函数转换方法解密...");
        
        // 常见的函数包装模式
        if (code.includes('eval(function(') || code.includes('eval (function(')) {
          // 替换eval为返回函数体
          const transformed = code.replace(/eval\s*\(\s*(function\s*\([^)]*\)[\s\S]*?})\s*\)/i, 
                                         "($1)()");
          
          try {
            const result = eval(transformed);
            
            if (result && typeof result === 'string' && result !== code) {
              console.log("[eval] 函数转换方法成功");
              return result;
            }
          } catch (evalError) {
            console.error("[eval] 函数转换执行失败:", evalError);
          }
        }
        
        console.log("[eval] 函数转换方法失败");
        return null;
      } catch (error) {
        console.error("[eval] 函数转换解密错误:", error);
        return null;
      }
    },
    
    // 方法4: 模拟执行
    simulatedUnpack: function(code) {
      try {
        console.log("[eval] 尝试使用模拟执行方法解密...");
        
        // 创建一个特殊的上下文
        const context = {
          result: null,
          window: {},
          document: {},
          navigator: {
            userAgent: "Mozilla/5.0"
          },
          location: {
            href: "http://example.com"
          }
        };
        
        // 添加eval捕获
        context.eval = function(evalCode) {
          context.result = evalCode;
          return evalCode;
        };
        
        // 替换全局调用
        const preparedCode = `
          var window = this.window;
          var document = this.document;
          var navigator = this.navigator;
          var location = this.location;
          ${code.replace(/eval\(/g, "this.eval(")}
        `;
        
        // 创建函数并绑定上下文
        const execFunc = new Function(preparedCode).bind(context);
        
        // 执行
        try {
          execFunc();
          
          if (context.result && typeof context.result === 'string' && context.result !== code) {
            console.log("[eval] 模拟执行方法成功");
            return context.result;
          }
        } catch (execError) {
          console.error("[eval] 模拟执行失败:", execError);
        }
        
        console.log("[eval] 模拟执行方法失败");
        return null;
      } catch (error) {
        console.error("[eval] 模拟执行解密错误:", error);
        return null;
      }
    },
    
    pack: function(code) {
      // 简单打包
      return `(function(){${code}})()`;
    }
  };
  
  console.log("增强型Eval解包插件已注册到全局解密插件库");
})();