// src/plugins/aaencode.js

const { VM } = require('vm2');

/**
 * 判断是否为 AAEncode 混淆
 * @param {string} code - 输入待判断的源码
 * @returns {boolean}
 */
function isAAEncode(code) {
  // 更全面的 AAEncode 特征检测
  const patterns = [
    /ﾟωﾟ/, // 常见于 AAEncode
    /ﾟДﾟ/, // 常用变量
    /ﾟｰﾟ/, // 常用变量
    /ﾟΘﾟ/, // 常用变量
    /o\^_\^o/, // 常见表情模式
    /\(c\^_\^o\)/, // 另一个常见模式
    /\(ﾟ\w+ﾟ\)/, // 通用的表情变量模式
    /｀ｍ´）ﾉ ~┻━┻/, // 初始化中常见的表情符号
  ];
  
  // 计算匹配的模式数量
  let matchCount = 0;
  for (const pattern of patterns) {
    if (pattern.test(code)) matchCount++;
  }
  
  // 如果至少匹配 2 个模式，则可能是 AAEncode
  return matchCount >= 2;
}

/**
 * 解密 AAEncode 混淆代码
 * @param {string} code - 输入的混淆源码
 * @returns {string|null} - 解密后的源码，失败返回 null
 */
function decodeAAencode(code) {
  if (!isAAEncode(code)) return null;

  // 捕获所有的 eval 和 Function 调用
  const capturedEvals = [];
  
  try {
    // 准备一个更复杂的 sandbox，捕获 eval 和 Function 调用
    const sandbox = {
      // 保存原始的全局对象，以便可以恢复
      _originalEval: eval,
      _originalFunction: Function,
      
      // 劫持 eval 调用
      eval: function(evalCode) {
        capturedEvals.push({
          type: 'eval',
          code: evalCode
        });
        
        // 如果代码太长，只记录摘要
        const logCode = evalCode.length > 100 
          ? evalCode.substring(0, 100) + '...' 
          : evalCode;
        console.log(`[AAEncode] 捕获到 eval 调用: ${logCode}`);
        
        // 在沙盒中执行 eval 代码
        return sandbox._originalEval(evalCode);
      },
      
      // 劫持 Function 构造函数
      Function: function() {
        const args = Array.from(arguments);
        const functionBody = args.pop();
        const functionParams = args;
        
        capturedEvals.push({
          type: 'Function',
          params: functionParams,
          body: functionBody
        });
        
        console.log(`[AAEncode] 捕获到 Function 构造: ${functionParams.join(', ')} => ${functionBody.substring(0, 50)}...`);
        
        // 返回原始的 Function 构造函数结果
        return new sandbox._originalFunction(...functionParams, functionBody);
      },
      
      // 添加常见的全局对象
      console: {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      },
      setTimeout,
      clearTimeout,
      setInterval,
      clearInterval
    };

    // 创建 VM 实例并执行代码
    const vm = new VM({
      timeout: 3000, // 增加超时时间，因为一些 AAEncode 可能需要更多执行时间
      sandbox
    });
    
    // 修改代码，添加一个包装器，以便我们可以获取关键变量和结果
    const wrappedCode = `
      try {
        ${code}
        // 返回可能的关键变量
        ({
          result: (typeof _ !== 'undefined' ? _ : undefined),
          variables: {
            omega: (typeof ﾟωﾟﾉ !== 'undefined' ? ﾟωﾟﾉ : undefined),
            dash: (typeof ﾟｰﾟ !== 'undefined' ? ﾟｰﾟ : undefined),
            theta: (typeof ﾟΘﾟ !== 'undefined' ? ﾟΘﾟ : undefined),
            cyrillic: (typeof ﾟДﾟ !== 'undefined' ? ﾟДﾟ : undefined),
            o: (typeof ﾟoﾟ !== 'undefined' ? ﾟoﾟ : undefined),
            c: (typeof c !== 'undefined' ? c : undefined),
            _o: (typeof o !== 'undefined' ? o : undefined)
          }
        });
      } catch (e) {
        ({ error: e.message });
      }
    `;

    const result = vm.run(wrappedCode);
    
    // 分析结果和捕获的 eval 调用
    console.log(`[AAEncode] 执行完成，捕获了 ${capturedEvals.length} 个 eval/Function 调用`);
    
    // 确定最终解密结果
    let deobfuscatedCode = null;
    
    // 如果有捕获的 eval，使用最后一个非空的 eval 作为结果
    if (capturedEvals.length > 0) {
      // 按从最后到最前的顺序查找非空的 eval
      for (let i = capturedEvals.length - 1; i >= 0; i--) {
        const eval = capturedEvals[i];
        const code = eval.code || eval.body;
        if (code && code.trim().length > 0) {
          // 确保结果是有效的 JavaScript 代码
          if (isValidJavaScript(code)) {
            deobfuscatedCode = code;
            break;
          }
        }
      }
    }
    
    // 如果没有找到有效的 eval 调用，但 VM 返回了字符串结果
    if (!deobfuscatedCode && result && typeof result === 'string') {
      deobfuscatedCode = result;
    }
    
    // 记录解密情况
    if (deobfuscatedCode) {
      console.log('[AAEncode] 解密成功');
      return deobfuscatedCode;
    } else {
      console.log('[AAEncode] 解密部分成功，但未找到有效的 JavaScript 代码');
      
      // 如果找不到合适的解密结果，但有 eval 调用，返回第一个非空的 eval
      if (capturedEvals.length > 0) {
        for (const eval of capturedEvals) {
          const code = eval.code || eval.body;
          if (code && code.trim().length > 0) {
            return code;
          }
        }
      }
      
      // 如果真的什么都没有，返回 null
      return null;
    }
  } catch (err) {
    console.error('[AAEncode] 解密失败:', err.message);
    
    // 尝试恢复部分解密结果
    if (capturedEvals.length > 0) {
      console.log('[AAEncode] 尝试从部分执行中恢复');
      
      // 使用最后一个非空的 eval 调用
      for (let i = capturedEvals.length - 1; i >= 0; i--) {
        const eval = capturedEvals[i];
        const code = eval.code || eval.body;
        if (code && code.trim().length > 0) {
          console.log('[AAEncode] 从部分执行中恢复了代码');
          return code;
        }
      }
    }
    
    return null;
  }
}

/**
 * 检查字符串是否是有效的 JavaScript 代码
 * @param {string} code - 要检查的代码
 * @returns {boolean} - 是否是有效的 JavaScript
 */
function isValidJavaScript(code) {
  try {
    // 尝试解析代码，但不执行它
    new Function(code);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 实现 plugin 接口
 * @param {string} code - 输入的混淆源码
 * @returns {string|null} - 解密后的源码，失败返回 null
 */
module.exports.plugin = function(code) {
  return decodeAAencode(code);
};

/**
 * 导出检测函数，以便可以在其他地方使用
 */
module.exports.isAAEncode = isAAEncode;

/**
 * 导出解密函数，以便可以在其他地方使用
 */
module.exports.decode = decodeAAencode;