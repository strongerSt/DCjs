/**
 * Eval解包打包工具包装器 - 将基于Babel的Eval解包打包工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始eval-tools.js插件代码
  // ====== 开始: 原始eval-tools.js代码 ======
  
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
      return null;
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
  
  // 导出插件接口
  exports.plugin = {
    unpack: unpack,
    pack: pack
  };
  
  // ====== 结束: 原始eval-tools.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.evalTools = {
    detect: function(code) {
      // 检测是否为eval包装的代码
      return code.includes('eval(') || 
             code.trim().startsWith('(function(){') || 
             code.includes('eval(function(');
    },
    unpack: function(code) {
      // 使用原始模块的解包功能
      return module.exports.plugin.unpack(code);
    },
    pack: function(code) {
      // 使用原始模块的打包功能
      return module.exports.plugin.pack(code);
    }
  };
  
  console.log("Eval解包打包插件已加载");
})();
