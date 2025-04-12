// src/plugin/aaencode.js
const { VM } = require('vm2');

/**
 * AAEncode解混淆插件
 * 
 * 专门处理日文表情符号混淆（AAEncode/颜文字加密）的代码
 * 
 * @param {string} code - 要解密的混淆代码
 * @returns {string|null} - 解密后的代码，如果失败则返回null
 */
function aaencodePlugin(code) {
  // 检查是否为AAEncode混淆
  if (!isAAEncode(code)) {
    return null;
  }
  
  console.log('[AAEncode] 检测到AAEncode特征，开始解密');
  
  try {
    // 预处理代码，处理特殊字符问题
    const sanitizedCode = sanitizeAAEncode(code);
    
    // 记录所有的eval调用
    const capturedEvals = [];
    
    // 创建沙盒环境
    const sandbox = {
      // 基本对象和函数
      Array, Object, String, Boolean, Number, RegExp, Date, Math,
      parseInt, parseFloat, isNaN, isFinite,
      
      // 控制台和定时器
      console: {
        log: console.log,
        error: console.error,
        warn: console.warn
      },
      setTimeout: (fn) => fn(),
      clearTimeout: () => {},
      
      // 拦截eval
      eval: function(evalCode) {
        capturedEvals.push({
          type: 'eval',
          code: evalCode
        });
        
        // 如果代码太长，只记录摘要
        const summary = evalCode.length > 50 
          ? evalCode.substring(0, 50) + '...' 
          : evalCode;
        console.log(`[AAEncode] 捕获eval调用: ${summary}`);
        
        // 尝试执行，但捕获错误
        try {
          return new Function(evalCode)();
        } catch (e) {
          console.log(`[AAEncode] Eval执行错误: ${e.message}`);
          return undefined;
        }
      },
      
      // 拦截Function构造函数
      Function: function() {
        const args = Array.from(arguments);
        const body = args.pop();
        const params = args;
        
        capturedEvals.push({
          type: 'Function',
          params: params,
          body: body
        });
        
        console.log(`[AAEncode] 捕获Function构造: 参数数量=${params.length}`);
        
        // 返回一个包装函数
        return function() {
          try {
            return new Function(...params, body)(...arguments);
          } catch (e) {
            console.log(`[AAEncode] Function执行错误: ${e.message}`);
            return undefined;
          }
        };
      }
    };
    
    // 尝试第一种方法：在VM沙盒中执行
    try {
      // 在VM中执行代码
      const vm = new VM({
        timeout: 5000,
        sandbox: sandbox,
        allowAsync: false
      });
      
      console.log('[AAEncode] 在沙盒中执行代码...');
      vm.run(sanitizedCode);
      console.log(`[AAEncode] 执行完成，捕获了${capturedEvals.length}个eval/Function调用`);
    } catch (vmError) {
      // VM执行失败，记录错误但继续尝试其他方法
      console.error(`[AAEncode] VM执行失败: ${vmError.message}`);
      
      // 尝试第二种方法：提取eval模式
      try {
        console.log('[AAEncode] 尝试提取eval模式...');
        const evalPattern = extractEvalPattern(sanitizedCode);
        if (evalPattern) {
          capturedEvals.push({
            type: 'extracted',
            code: evalPattern
          });
          console.log('[AAEncode] 成功提取eval模式');
        }
      } catch (extractError) {
        console.error(`[AAEncode] 提取eval模式失败: ${extractError.message}`);
      }
    }
    
    // 如果没有捕获到eval，返回null
    if (capturedEvals.length === 0) {
      console.log('[AAEncode] 未捕获到任何动态代码');
      return null;
    }
    
    // 从捕获的eval中寻找最可能的解混淆结果
    let deobfuscatedCode = null;
    
    // 首先尝试找到有效的JavaScript
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body || '';
      
      if (evalCode && evalCode.length > 0) {
        try {
          // 验证是否是有效的JavaScript
          new Function(evalCode);
          deobfuscatedCode = evalCode;
          console.log(`[AAEncode] 找到有效的JavaScript代码(#${i})`);
          break;
        } catch (e) {
          // 继续尝试下一个
        }
      }
    }
    
    // 如果找到了解混淆代码，返回它
    if (deobfuscatedCode) {
      console.log('[AAEncode] 解密成功');
      return deobfuscatedCode;
    }
    
    // 如果没有找到有效的JavaScript，尝试返回最后一个非空的eval
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body || '';
      
      if (evalCode && evalCode.length > 0) {
        console.log('[AAEncode] 未找到有效的JavaScript，返回最后一个非空捕获');
        return evalCode;
      }
    }
    
    console.log('[AAEncode] 无法解密代码');
    return null;
  } catch (err) {
    console.error(`[AAEncode] 解密过程中发生错误: ${err.message}`);
    return null;
  }
}

/**
 * 判断是否为AAEncode混淆
 * @param {string} code - 输入待判断的源码
 * @returns {boolean}
 */
function isAAEncode(code) {
  // 检查常见的AAEncode特征
  const patterns = [
    /ﾟωﾟ/,     // 常见于AAEncode
    /ﾟДﾟ/,     // 常用变量
    /ﾟｰﾟ/,     // 常用变量
    /ﾟΘﾟ/,     // 常用变量
    /o\^_\^o/, // 常见表情模式
    /｀ｍ´）ﾉ ~┻━┻/ // 翻桌子表情，常见于AAEncode
  ];
  
  // 计算匹配的模式数量
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(code)) matchCount++;
  }
  
  // 如果至少匹配2个模式，则可能是AAEncode
  return matchCount >= 2;
}

/**
 * 预处理AAEncode代码，处理特殊字符问题
 * @param {string} code - 原始AAEncode代码
 * @returns {string} - 处理后的代码
 */
function sanitizeAAEncode(code) {
  // 修复已知的问题字符
  let sanitized = code;
  
  // 修复"iﾉ"问题 - 这是导致"Unexpected identifier 'iﾉ'"错误的原因
  sanitized = sanitized.replace(/(ﾟωﾟ)i iﾉ/g, "$1i_i");
  sanitized = sanitized.replace(/iﾉ/g, "i_i");
  
  // 修复其他潜在的问题字符组合
  sanitized = sanitized.replace(/([^_a-zA-Z0-9])\s+([^_a-zA-Z0-9])/g, "$1$2");
  
  // 处理可能导致语法错误的其他模式
  sanitized = sanitized.replace(/\(ﾟΘﾟ\)\s*=\s*\(o\^_\^o\)/g, "(ﾟΘﾟ)=(o^_^o)");
  
  return sanitized;
}

/**
 * 提取AAEncode中的eval模式
 * 用于在VM执行失败时的备选方法
 * @param {string} code - AAEncode代码
 * @returns {string|null} - 提取的eval内容
 */
function extractEvalPattern(code) {
  // 寻找常见的AAEncode eval模式
  const evalRegex = /\(ﾟДﾟ\)\s*\[\s*'\s*_\s*'\s*\]\s*\(\s*(.+?)\s*\)\s*\(\s*'_'\s*\)/;
  const match = code.match(evalRegex);
  
  if (match && match[1]) {
    return `(function(){${match[1]}})()`;
  }
  
  // 尝试其他可能的eval模式
  const altEvalRegex = /\(ﾟoﾟ\)\s*\(\s*(.+?)\s*\)/;
  const altMatch = code.match(altEvalRegex);
  
  if (altMatch && altMatch[1]) {
    return `(function(){${altMatch[1]}})()`;
  }
  
  return null;
}

// 直接导出函数
module.exports = aaencodePlugin;