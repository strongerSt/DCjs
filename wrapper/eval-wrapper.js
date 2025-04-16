
/**
 * 增强版Eval解包打包工具包装器 - 支持多层解包
 */
(function() {
  // 创建插件注册函数
  function registerPlugin() {
    // 判断是否已经加载Babel相关库
    const hasBabel = window.Babel && window.Babel.parse && window.Babel.types && window.Babel.traverse && window.Babel.generator;
    
    if (hasBabel) {
      // 使用完整功能的Babel版本
      function unpackSingle(code) {
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
          console.error("单次Eval解包错误:", e);
          return null;
        }
      }

      // 多层解包函数
      function unpack(code) {
        try {
          let result = code;
          let prevResult = null;
          let layerCount = 0;
          
          // 最多尝试解包5层
          const MAX_LAYERS = 5;
          
          while (layerCount < MAX_LAYERS) {
            prevResult = result;
            const unpacked = unpackSingle(result);
            
            // 如果解包失败或没有变化，停止解包
            if (!unpacked || unpacked === result) {
              break;
            }
            
            console.log(`[eval] 成功解开第 ${layerCount + 1} 层eval加密`);
            result = unpacked;
            layerCount++;
          }
          
          // 如果至少解开了一层
          if (layerCount > 0) {
            console.log(`[eval] 总共解开了 ${layerCount} 层eval加密`);
            return result;
          }
          
          return null;
        } catch (e) {
          console.error("多层Eval解包错误:", e);
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
      
      console.log("Eval插件已加载(增强Babel版)");
      return { unpack, pack };
    } else {
      // 简化版实现，不依赖Babel
      function simpleEvalUnpack(code) {
        try {
          let result = code;
          let prevResult = null;
          let layerCount = 0;
          const MAX_LAYERS = 5;
          
          while (layerCount < MAX_LAYERS) {
            prevResult = result;
            
            // 常见的eval模式
            if (result.includes('eval(function(')) {
              // 尝试提取eval中的内容
              const evalRegex = /eval\((function\(.*?\)[\s\S]*?\{[\s\S]*?\}[\s\S]*?)\)/;
              const match = result.match(evalRegex);
              
              if (match && match[1]) {
                try {
                  const unpacked = eval(match[1]);
                  if (unpacked && unpacked !== result) {
                    console.log(`[eval] 成功解开第 ${layerCount + 1} 层eval加密(简易版)`);
                    result = unpacked;
                    layerCount++;
                    continue;
                  }
                } catch (e) {
                  console.error("无法执行提取的函数:", e);
                }
              }
            }
            
            // 简单替换方法
            if (result.includes('eval(')) {
              try {
                // 替换eval为空函数并尝试执行
                const modifiedCode = result.replace(/eval\(/g, '(');
                const unpacked = eval(modifiedCode);
                
                if (unpacked && unpacked !== result) {
                  console.log(`[eval] 成功解开第 ${layerCount + 1} 层eval加密(简易版)`);
                  result = unpacked;
                  layerCount++;
                  continue;
                }
              } catch (e) {
                console.error("简单替换解包失败:", e);
              }
            }
            
            // 如果没有成功解包，跳出循环
            break;
          }
          
          if (layerCount > 0) {
            console.log(`[eval] 总共解开了 ${layerCount} 层eval加密(简易版)`);
            return result;
          }
          
          return null;
        } catch (e) {
          console.error("简易多层Eval解包错误:", e);
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
  console.log("增强版Eval解包打包插件已注册到全局解密插件库");
})();