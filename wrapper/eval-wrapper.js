
/**
 * Eval解包打包工具包装器
 */
(function() {
  // 创建插件注册函数
  function registerPlugin() {
    // 判断是否已经加载Babel相关库
    const hasBabel = window.Babel && window.Babel.parse && window.Babel.types && window.Babel.traverse && window.Babel.generator;
    
    if (hasBabel) {
      // 使用完整功能的Babel版本
      function unpack(code) {
        try {
          let ast = window.Babel.parse(code, { errorRecovery: true });
          let lines = ast.program.body;
          let data = null;
          const t = window.Babel.types;
          
          for (let line of lines) {
            if (t.isEmptyStatement(line)) {
              continue;
            }
            if (data) {
              return null;
            }
            if (
              t.isCallExpression(line?.expression) &&
              line.expression.callee?.name === 'eval' &&
              line.expression.arguments.length === 1 &&
              t.isCallExpression(line.expression.arguments[0])
            ) {
              data = t.expressionStatement(line.expression.arguments[0]);
              continue;
            }
            return null;
          }
          
          if (!data) {
            return null;
          }
          
          code = window.Babel.generator(data, { minified: true }).code;
          return eval(code);
        } catch (e) {
          console.error("Eval解包错误:", e);
          return simpleEvalUnpack(code);
        }
      }

      function pack(code) {
        try {
          const t = window.Babel.types;
          let ast1 = window.Babel.parse('(function(){}())');
          let ast2 = window.Babel.parse(code);
          
          window.Babel.traverse(ast1, {
            FunctionExpression(path) {
              let body = t.blockStatement(ast2.program.body);
              path.replaceWith(t.functionExpression(null, [], body));
              path.stop();
            },
          });
          
          code = window.Babel.generator(ast1, { minified: false }).code;
          return code;
        } catch (e) {
          console.error("Eval打包错误:", e);
          return null;
        }
      }
      
      console.log("Eval插件已加载(Babel版)");
      return { unpack, pack };
    } else {
      // 简化版实现，不依赖Babel
      function simpleEvalUnpack(code) {
        try {
          // 常见的eval模式
          if (code.includes('eval(function(')) {
            // 尝试提取eval中的内容
            const evalRegex = /eval\((function\(.*?\)[\s\S]*?\{[\s\S]*?\}[\s\S]*?)\)/;
            const match = code.match(evalRegex);
            
            if (match && match[1]) {
              try {
                return eval(match[1]);
              } catch (e) {
                console.error("无法执行提取的函数:", e);
              }
            }
          }
          
          // 简单替换方法
          if (code.includes('eval(')) {
            try {
              // 替换eval为空函数并尝试执行
              const modifiedCode = code.replace(/eval\(/g, '(');
              return eval(modifiedCode);
            } catch (e) {
              console.error("简单替换解包失败:", e);
            }
          }
          
          return null;
        } catch (e) {
          console.error("简易Eval解包错误:", e);
          return null;
        }
      }
      
      console.warn("Babel库未找到，Eval插件将使用简易版本");
      return {
        unpack: simpleEvalUnpack,
        pack: function(code) { return code; }
      };
    }
  }
  
  // 注册插件到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  
  // 创建实际的插件对象
  const plugin = registerPlugin();
  
  window.DecodePlugins.eval = {
    detect: function(code) {
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    unpack: function(code) {
      return plugin.unpack(code);
    },
    pack: function(code) {
      return plugin.pack ? plugin.pack(code) : code;
    }
  };
  
  // 加载完成消息
  console.log("Eval解包打包插件已注册到全局解密插件库");
})();