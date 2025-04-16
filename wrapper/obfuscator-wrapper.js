/**
 * JS-Obfuscator解密工具包装器 - 将JS-Obfuscator解密工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始obfuscator.js插件代码
  // ====== 开始: 原始obfuscator.js代码 ======
  
  function plugin(code) {
    try {
      // 检测是否为Obfuscator.io混淆的代码
      if (!isObfuscatorCode(code)) {
        return null;
      }
      
      // 创建AST
      const ast = window.Babel.parse(code, { 
        sourceType: 'script',
        errorRecovery: true 
      });
      
      // 应用解混淆转换
      const t = window.Babel.types;
      
      // 1. 解析字符串数组
      const stringArrays = extractStringArrays(ast, t);
      
      // 2. 应用转换
      window.Babel.traverse(ast, createVisitor(stringArrays, t));
      
      // 3. 生成代码
      return window.Babel.generator(ast, { 
        comments: false,
        compact: false 
      }).code;
    } catch (e) {
      console.error("Obfuscator解密错误:", e);
      return null;
    }
  }
  
  // 检测是否为Obfuscator.io混淆的代码
  function isObfuscatorCode(code) {
    // Obfuscator.io混淆代码的特征包括:
    return (code.includes('_0x') && code.includes('push')) || // 字符串数组特征
           (code.includes('var a0_0x') || code.includes('const a0_0x')) || // 常见变量命名
           (code.includes('var _0x') && code.includes('shift')) || // 数组操作
           (code.includes('String.fromCharCode') && code.match(/\\x[0-9a-f]{2}/g)) || // 字符转义
           (code.includes('constructor') && code.includes('debugger')); // 反调试
  }
  
  // 提取字符串数组
  function extractStringArrays(ast, t) {
    const stringArrays = {};
    
    window.Babel.traverse(ast, {
      VariableDeclarator(path) {
        // 查找形如: var _0x1234 = ['string1', 'string2', ...];
        const node = path.node;
        if (t.isIdentifier(node.id) && 
            t.isArrayExpression(node.init) &&
            /^_0x|^a0_0x/.test(node.id.name)) {
          
          const arrayName = node.id.name;
          const elements = node.init.elements;
          
          // 检查数组元素是否都是字符串
          if (elements && elements.every(el => t.isStringLiteral(el))) {
            stringArrays[arrayName] = elements.map(el => el.value);
          }
        }
      }
    });
    
    return stringArrays;
  }
  
  // 创建访问器
  function createVisitor(stringArrays, t) {
    return {
      // 替换字符串数组的索引访问
      MemberExpression(path) {
        const { object, property, computed } = path.node;
        
        // 检查是否是数组访问表达式: _0x1234[index]
        if (computed && 
            t.isIdentifier(object) && 
            stringArrays[object.name]) {
          
          // 如果索引是数字字面量
          if (t.isNumericLiteral(property)) {
            const index = property.value;
            const array = stringArrays[object.name];
            
            if (index >= 0 && index < array.length) {
              path.replaceWith(t.stringLiteral(array[index]));
            }
          }
          // 如果索引是二元表达式（如 _0x1234[1 + 2]）
          else if (t.isBinaryExpression(property) && 
                  property.operator === '+' && 
                  t.isNumericLiteral(property.left) && 
                  t.isNumericLiteral(property.right)) {
            
            const index = property.left.value + property.right.value;
            const array = stringArrays[object.name];
            
            if (index >= 0 && index < array.length) {
              path.replaceWith(t.stringLiteral(array[index]));
            }
          }
        }
      },
      
      // 计算简单的二元表达式
      BinaryExpression(path) {
        const { left, right, operator } = path.node;
        
        // 只计算数字字面量的简单表达式
        if (t.isNumericLiteral(left) && t.isNumericLiteral(right)) {
          let result;
          
          switch (operator) {
            case '+': result = left.value + right.value; break;
            case '-': result = left.value - right.value; break;
            case '*': result = left.value * right.value; break;
            case '/': result = left.value / right.value; break;
            case '%': result = left.value % right.value; break;
            case '<<': result = left.value << right.value; break;
            case '>>': result = left.value >> right.value; break;
            case '>>>': result = left.value >>> right.value; break;
            case '|': result = left.value | right.value; break;
            case '&': result = left.value & right.value; break;
            case '^': result = left.value ^ right.value; break;
            default: return;
          }
          
          path.replaceWith(t.numericLiteral(result));
        }
        
        // 字符串连接
        if (operator === '+' && 
            t.isStringLiteral(left) && 
            t.isStringLiteral(right)) {
          path.replaceWith(t.stringLiteral(left.value + right.value));
        }
      },
      
      // 处理控制流扁平化
      SwitchStatement(path) {
        const { discriminant, cases } = path.node;
        
        // 检查是否是控制流扁平化模式：通常有一个变量作为状态控制
        if (t.isIdentifier(discriminant) && cases.length > 2) {
          const controlVar = discriminant.name;
          
          // 检查每个case是否设置了控制变量
          const validPattern = cases.every(caseNode => {
            const lastStmt = caseNode.consequent[caseNode.consequent.length - 1];
            return t.isExpressionStatement(lastStmt) && 
                   t.isAssignmentExpression(lastStmt.expression) && 
                   t.isIdentifier(lastStmt.expression.left) && 
                   lastStmt.expression.left.name === controlVar;
          });
          
          if (validPattern) {
            // 这是控制流扁平化，但复杂重构超出了简单包装器的范围
            // 实际实现会更复杂，需要追踪控制流并重建原始结构
            console.log("检测到控制流扁平化，但需要更高级的解混淆工具");
          }
        }
      }
    };
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始obfuscator.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.obfuscator = {
    detect: function(code) {
      // 使用isObfuscatorCode函数检测
      return isObfuscatorCode(code);
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    }
  };
  
  console.log("JS-Obfuscator解密插件已加载");
})();
