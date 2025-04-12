// src/plugin/aaencode.js

const { VM } = require('vm2');

/**
 * AAEncode 解混淆插件
 * 
 * 用于解密使用日文表情符号混淆的 JavaScript 代码
 * 这种混淆通常以 ﾟωﾟﾉ、ﾟｰﾟ、ﾟΘﾟ 等表情符号为特征
 */

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
  if (!isAAEncode(code)) {
    console.log('[AAEncode] 未检测到 AAEncode 特征，跳过解密');
    return null;
  }
  
  console.log('[AAEncode] 检测到 AAEncode 特征，开始解密');

  // 捕获所有的 eval 和 Function 调用
  const capturedEvals = [];
  
  try {
    // 准备一个沙盒环境，捕获 eval 和 Function 调用
    const sandbox = {
      // 基本 JavaScript 对象
      Array,
      Object,
      String,
      Boolean,
      Number,
      Date,
      Math,
      RegExp,
      Error,
      
      // 基本 JavaScript 函数
      parseInt,
      parseFloat,
      isNaN,
      isFinite,
      decodeURI,
      decodeURIComponent,
      encodeURI,
      encodeURIComponent,
      
      // 控制台对象
      console: {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      },
      
      // 定时器函数
      setTimeout: (fn) => fn(), // 简化的版本，立即执行
      clearTimeout: () => {},
      setInterval: (fn) => fn(),
      clearInterval: () => {},
      
      // 拦截 eval 函数
      eval: function(evalCode) {
        capturedEvals.push({
          type: 'eval',
          code: evalCode
        });
        
        // 记录捕获的代码概要
        if (evalCode && evalCode.length > 0) {
          const summary = evalCode.length > 100 
            ? evalCode.substring(0, 100) + '...' 
            : evalCode;
          console.log(`[AAEncode] 捕获 eval 代码: ${summary}`);
        }
        
        // 在沙盒中执行代码，但捕获错误
        try {
          // 注意：在VM2中，我们需要特殊处理eval的执行
          // 这里我们使用Function构造函数作为替代
          const fn = new Function(evalCode);
          return fn.call(sandbox);
        } catch (e) {
          console.error(`[AAEncode] Eval 执行错误: ${e.message}`);
          return undefined;
        }
      },
      
      // 拦截 Function 构造函数
      Function: function() {
        const args = Array.from(arguments);
        const functionBody = args.pop();
        const functionParams = args;
        
        capturedEvals.push({
          type: 'Function',
          params: functionParams,
          body: functionBody
        });
        
        console.log(`[AAEncode] 捕获 Function 构造: 参数(${functionParams.length}个)，代码长度: ${functionBody.length}`);
        
        // 返回一个包装的函数
        return function() {
          try {
            // 为安全起见，我们使用VM的Function构造
            const fn = new Function(...functionParams, functionBody);
            return fn.apply(this, arguments);
          } catch (e) {
            console.error(`[AAEncode] Function 执行错误: ${e.message}`);
            return undefined;
          }
        };
      }
    };

    // 在 VM 中执行代码
    const vm = new VM({
      timeout: 5000, // 5秒超时
      sandbox,
      allowAsync: false
    });
    
    // 修改代码，添加一个包装器
    const wrappedCode = `
      try {
        ${code}
        // 尝试返回结果
        "执行完成";
      } catch (e) {
        "执行错误: " + e.message;
      }
    `;

    // 执行代码
    console.log('[AAEncode] 在沙盒中执行代码...');
    const execResult = vm.run(wrappedCode);
    console.log(`[AAEncode] 执行结果: ${execResult}`);
    console.log(`[AAEncode] 捕获了 ${capturedEvals.length} 个 eval/Function 调用`);
    
    // 如果没有捕获到任何eval，返回null
    if (capturedEvals.length === 0) {
      console.log('[AAEncode] 未捕获到任何动态代码，无法解密');
      return null;
    }
    
    // 分析捕获的eval调用
    // 通常最后一个非空的eval包含解密后的代码
    let deobfuscatedCode = null;
    
    // 按从最后到最前的顺序查找非空的有效JS代码
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body;
      
      if (evalCode && evalCode.trim().length > 0) {
        // 检查代码是否是有效的JS
        if (isValidJavaScript(evalCode)) {
          deobfuscatedCode = evalCode;
          console.log(`[AAEncode] 找到有效的JavaScript代码(来自捕获#${i})`);
          break;
        }
      }
    }
    
    // 如果找到了解密代码，返回它
    if (deobfuscatedCode) {
      console.log('[AAEncode] 解密成功');
      return deobfuscatedCode;
    }
    
    // 如果没有找到有效的JS代码，使用第一个非空的eval
    for (const evalObj of capturedEvals) {
      const evalCode = evalObj.code || evalObj.body;
      if (evalCode && evalCode.trim().length > 0) {
        console.log('[AAEncode] 未找到有效JS代码，返回第一个非空捕获');
        return evalCode;
      }
    }
    
    // 如果真的什么都没有
    console.log('[AAEncode] 无法解密代码');
    return null;
    
  } catch (err) {
    console.error('[AAEncode] 解密过程中发生错误:', err.message);
    
    // 尝试从部分执行中恢复
    if (capturedEvals.length > 0) {
      console.log('[AAEncode] 尝试从部分执行中恢复');
      
      // 使用最后一个非空的eval
      for (let i = capturedEvals.length - 1; i >= 0; i--) {
        const evalObj = capturedEvals[i];
        const evalCode = evalObj.code || evalObj.body;
        
        if (evalCode && evalCode.trim().length > 0) {
          console.log('[AAEncode] 从部分执行中恢复了代码');
          return evalCode;
        }
      }
    }
    
    return null;
  }
}

/**
 * 检查字符串是否是有效的JavaScript代码
 * @param {string} code - 要检查的代码
 * @returns {boolean} - 是否是有效的JavaScript
 */
function isValidJavaScript(code) {
  try {
    // 尝试解析代码，但不执行
    Function(code);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 实现插件接口
 * 
 * 注意：根据错误消息，你的系统期望插件导出一个名为'plugin'的函数
 * 
 * @param {string} code - 输入的混淆源码 
 * @returns {string|null} - 解密后的源码，失败返回null
 */
function plugin(code) {
  console.log('[AAEncode] 开始处理代码...');
  const result = decodeAAencode(code);
  
  if (result) {
    console.log('[AAEncode] 解密成功，返回结果');
    return result;
  } else {
    console.log('[AAEncode] 解密失败，返回null');
    return null;
  }
}

// 导出plugin函数以符合你的系统要求
module.exports.plugin = plugin;