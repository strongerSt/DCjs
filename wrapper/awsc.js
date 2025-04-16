/**
 * Babel代码格式化工具包装器 - 将基于Babel的代码格式化工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始babel-beautifier.js插件代码
  // ====== 开始: 原始babel-beautifier.js代码 ======
  
  function plugin(code) {
    let ast = window.Babel.parse(code);
    // Lint
    window.Babel.traverse(ast, {
      UnaryExpression: RemoveVoid,
    });
    window.Babel.traverse(ast, {
      ConditionalExpression: { exit: LintConditionalAssign },
    });
    LintConditionalIf(ast);
    window.Babel.traverse(ast, {
      LogicalExpression: { exit: LintLogicalIf },
    });
    window.Babel.traverse(ast, {
      IfStatement: { exit: LintIfStatement },
    });
    window.Babel.traverse(ast, {
      IfStatement: { enter: LintIfTest },
    });
    window.Babel.traverse(ast, {
      SwitchCase: { enter: LintSwitchCase },
    });
    window.Babel.traverse(ast, {
      ReturnStatement: { enter: LintReturn },
    });
    window.Babel.traverse(ast, {
      SequenceExpression: { exit: LintSequence },
    });
    window.Babel.traverse(ast, {
      BlockStatement: { exit: LintBlock },
    });

    code = window.Babel.generator(ast, {
      comments: false,
      jsescOption: { minimal: true },
    }).code;
    return code;
  }
  
  function RemoveVoid(path) {
    if (path.node.operator === 'void') {
      path.replaceWith(path.node.argument);
    }
  }

  function LintConditionalAssign(path) {
    const t = window.Babel.types;
    if (!t.isAssignmentExpression(path?.parent)) {
      return;
    }
    let { test, consequent, alternate } = path.node;
    let { operator, left } = path.parent;
    consequent = t.assignmentExpression(operator, left, consequent);
    alternate = t.assignmentExpression(operator, left, alternate);
    path.parentPath.replaceWith(
      t.conditionalExpression(test, consequent, alternate)
    );
  }

  function LintConditionalIf(ast) {
    const t = window.Babel.types;
    function conditional(path) {
      let { test, consequent, alternate } = path.node;
      if (t.isSequenceExpression(path.parent)) {
        if (!sequence(path.parentPath)) {
          path.stop();
        }
        return;
      }
      if (t.isLogicalExpression(path.parent)) {
        if (!logical(path.parentPath)) {
          path.stop();
        }
        return;
      }
      if (!t.isExpressionStatement(path.parent)) {
        console.error(`Unexpected parent type: ${path.parent.type}`);
        path.stop();
        return;
      }
      consequent = t.expressionStatement(consequent);
      alternate = t.expressionStatement(alternate);
      let statement = t.ifStatement(test, consequent, alternate);
      path.replaceWithMultiple(statement);
    }

    function sequence(path) {
      if (t.isLogicalExpression(path.parent)) {
        return logical(path.parentPath);
      }
      let body = [];
      for (const item of path.node.expressions) {
        body.push(t.expressionStatement(item));
      }
      let node = t.blockStatement(body, []);
      let replace_path = path;
      if (t.isExpressionStatement(path.parent)) {
        replace_path = path.parentPath;
      } else if (!t.isBlockStatement(path.parent)) {
        console.error(`Unexpected parent type: ${path.parent.type}`);
        return false;
      }
      replace_path.replaceWith(node);
      return true;
    }

    function logical(path) {
      let { operator, left, right } = path.node;
      if (operator !== '&&') {
        console.error(`Unexpected logical operator: ${operator}`);
        return false;
      }
      if (!t.isExpressionStatement(path.parent)) {
        console.error(`Unexpected parent type: ${path.parent.type}`);
        return false;
      }
      let node = t.ifStatement(left, t.expressionStatement(right));
      path.parentPath.replaceWith(node);
      return true;
    }

    window.Babel.traverse(ast, {
      ConditionalExpression: { enter: conditional },
    });
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始babel-beautifier.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.babelBeautifier = {
    detect: function(code) {
      return code.includes('void 0') || code.includes(';if(') || code.includes('&&');
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    }
  };
  
  console.log("Babel代码格式化插件已加载");
})();
