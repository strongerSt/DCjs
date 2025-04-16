
/**
 * Eval解包打包工具包装器
 */
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 检查Babel是否可用
  if (window.Babel) {
    // 如果Babel可用，使用完整功能
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
        return fallbackUnpack(code);
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
    
    // 导出完整插件接口
    exports.plugin = {
      unpack: unpack,
      pack: pack
    };
    
    console.log("Eval插件已加载(完整版)");
  } else {
    // 如果Babel不可用，提供基本的回退功能
    console.warn("Babel库未找到，Eval插件将使用基本功能");
    
    // 基本的eval解包功能
    function fallbackUnpack(code) {
      try {
        // 尝试找到eval表达式
        const evalRegex = /eval\((function\(.*?\)\s*\{[\s\S]*?\})\)/;
        const match = code.match(evalRegex);
        
        if (match && match[1]) {
          // 直接尝试执行内部函数
          return eval(match[1]);
        }
        
        // 尝试执行简单的eval解码
        if (code.includes('eval(')) {
          try {
            // 注意：这种简单替换可能不适用于所有情况
            const unwrapped = code.replace(/eval\(/g, '(');
            return eval(unwrapped);
          } catch (e) {
            console.error("简单eval解包失败:", e);
          }
        }
        
        return null;
      } catch (e) {
        console.error("基本Eval解包错误:", e);
        return null;
      }
    }
    
    // 导出基本插件接口
    exports.plugin = {
      unpack: fallbackUnpack,
      pack: function(code) { return code; } // 不做包装
    };
    
    console.log("Eval插件已加载(基本版)");
  }
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.eval = {
    detect: function(code) {
      // 检测是否为eval包装的代码
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    unpack: function(code) {
      return module.exports.plugin.unpack(code);
    },
    pack: function(code) {
      return module.exports.plugin.pack ? module.exports.plugin.pack(code) : code;
    }
  };
})();