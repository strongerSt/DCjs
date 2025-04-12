// src/plugin/aaencode.js
const { VM } = require('vm2');

/**
 * AAEncode 解混淆插件
 * 
 * @param {string} code - 要解密的混淆代码
 * @returns {string|null} - 解密后的代码，如果失败则返回 null
 */
function aaencodePlugin(code) {
  // 检查是否为 AAEncode 混淆
  if (!isAAEncode(code)) {
    console.log('[AAEncode] 未检测到 AAEncode 特征');
    return null;
  }
  
  console.log('[AAEncode] 检测到 AAEncode 特征，开始解密');
  
  // 记录所有的 eval 调用
  const capturedEvals = [];
  
  try {
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
      
      // 拦截 eval
      eval: function(evalCode) {
        capturedEvals.push({
          type: 'eval',
          code: evalCode
        });
        console.log(`[AAEncode] 捕获 eval 调用: 长度=${evalCode.length}`);
        
        // 沙盒中执行 eval
        try {
          return new Function(evalCode)();
        } catch (e) {
          console.error('[AAEncode] Eval 执行错误:', e.message);
          return undefined;
        }
      },
      
      // 拦截 Function 构造函数
      Function: function() {
        const args = Array.from(arguments);
        const body = args.pop();
        const params = args;
        
        capturedEvals.push({
          type: 'Function',
          params: params,
          body: body
        });
        
        console.log(`[AAEncode] 捕获 Function 构造: 参数=${params.length}, 长度=${body.length}`);
        
        // 返回一个包装函数
        return function() {
          try {
            return new Function(...params, body)(...arguments);
          } catch (e) {
            console.error('[AAEncode] Function 执行错误:', e.message);
            return undefined;
          }
        };
      }
    };

    // 在 VM 中执行代码
    const vm = new VM({
      timeout: 5000,
      sandbox: sandbox
    });
    
    console.log('[AAEncode] 在沙盒中执行代码...');
    vm.run(code);
    console.log(`[AAEncode] 执行完成，捕获了 ${capturedEvals.length} 个 eval/Function 调用`);
    
    // 如果没有捕获到 eval，返回 null
    if (capturedEvals.length === 0) {
      console.log('[AAEncode] 未捕获到任何动态代码');
      return null;
    }
    
    // 分析捕获的 eval 调用
    // 通常最后一个有效的 eval 包含解密后的代码
    let deobfuscatedCode = null;
    
    // 从后往前找有效的 JavaScript 代码
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body;
      
      if (evalCode && evalCode.length > 0) {
        try {
          // 检查是否是有效的 JavaScript
          new Function(evalCode);
          deobfuscatedCode = evalCode;
          console.log(`[AAEncode] 找到有效的 JavaScript 代码 (捕获 #${i})`);
          break;
        } catch (e) {
          // 不是有效的 JavaScript，继续查找
        }
      }
    }
    
    // 如果找到了解密代码，返回它
    if (deobfuscatedCode) {
      console.log('[AAEncode] 解密成功');
      return deobfuscatedCode;
    }
    
    // 如果没有找到有效的 JavaScript，返回第一个非空的 eval
    for (const evalObj of capturedEvals) {
      const evalCode = evalObj.code || evalObj.body;
      if (evalCode && evalCode.length > 0) {
        console.log('[AAEncode] 未找到有效的 JavaScript，返回第一个非空捕获');
        return evalCode;
      }
    }
    
    console.log('[AAEncode] 无法解密代码');
    return null;
  } catch (err) {
    console.error('[AAEncode] 解密过程中发生错误:', err.message);
    
    // 尝试从部分执行中恢复
    if (capturedEvals.length > 0) {
      for (const evalObj of capturedEvals) {
        const evalCode = evalObj.code || evalObj.body;
        if (evalCode && evalCode.length > 0) {
          console.log('[AAEncode] 从部分执行中恢复代码');
          return evalCode;
        }
      }
    }
    
    return null;
  }
}

/**
 * 判断是否为 AAEncode 混淆
 * @param {string} code - 输入待判断的源码
 * @returns {boolean}
 */
function isAAEncode(code) {
  // 检查常见的 AAEncode 特征
  const patterns = [
    /ﾟωﾟ/,     // 常见于 AAEncode
    /ﾟДﾟ/,     // 常用变量
    /ﾟｰﾟ/,     // 常用变量
    /ﾟΘﾟ/,     // 常用变量
    /o\^_\^o/, // 常见表情模式
    /｀ｍ´）ﾉ ~┻━┻/ // 翻桌子表情，常见于 AAEncode
  ];
  
  // 计算匹配的模式数量
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(code)) matchCount++;
  }
  
  // 如果至少匹配 2 个模式，则可能是 AAEncode
  return matchCount >= 2;
}

// 直接导出函数 - 这是关键！
module.exports = aaencodePlugin;