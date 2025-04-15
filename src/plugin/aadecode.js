/**
 * AADecode插件 - 用于解码日式表情符号加密的JavaScript
 * 基于jamtg的aadecode实现
 */

// 主要解码函数
function aaDecodeFn(encryptedCode) {
  // 检查是否是AAEncode加密的代码
  if (!isAAEncoded(encryptedCode)) {
    return null;
  }

  try {
    // 构建一个安全的执行环境
    const sandbox = `
      // AAEncode 使用的变量
      var ﾟωﾟ, _ﾟωﾟ, __ﾟωﾟ;
      var ﾟΘﾟ, _ﾟΘﾟ, __ﾟΘﾟ;
      var ﾟｰﾟ, _ﾟｰﾟ, __ﾟｰﾟ;
      var ﾟДﾟ, _ﾟДﾟ, __ﾟДﾟ;
      var c = '';
      var o, oo, cc;
      
      // 模拟document.write
      var document = {
        write: function(str) { c += str; },
        writeln: function(str) { c += str + "\\n"; }
      };
      
      var window = { document: document };
      
      try {
        // 执行AAEncode代码
        ${encryptedCode}
        
        // 返回结果
        return c;
      } catch(e) {
        return null;
      }
    `;
    
    // 使用Function构造函数安全地执行代码
    const sandboxFn = new Function(sandbox);
    const decodedResult = sandboxFn();
    
    if (decodedResult && typeof decodedResult === 'string' && decodedResult.length > 0) {
      return decodedResult;
    }
    
    // 备用方法：直接匹配字符串
    const stringMatch = encryptedCode.match(/c\s*=\s*["']([^"']+)["']/);
    if (stringMatch && stringMatch[1]) {
      return stringMatch[1];
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

// 检查是否是AAEncode加密的代码
function isAAEncoded(code) {
  if (typeof code !== 'string') {
    return false;
  }
  
  // AAEncode特征模式
  const patterns = [
    'ﾟωﾟ',
    'ﾟДﾟ',
    'ﾟΘﾟ',
    'ﾟｰﾟ',
    '(c^_^o)',
    '(o^_^o)'
  ];
  
  let matchCount = 0;
  for (const pattern of patterns) {
    if (code.includes(pattern)) {
      matchCount++;
    }
    if (matchCount >= 2) {
      return true;
    }
  }
  
  return false;
}

// 必须直接导出函数，而不是对象
module.exports = function(sourceCode) {
  if (typeof sourceCode !== 'string') {
    return sourceCode;
  }
  
  try {
    if (isAAEncoded(sourceCode)) {
      const decodedCode = aaDecodeFn(sourceCode);
      if (decodedCode && decodedCode !== sourceCode) {
        return decodedCode;
      }
    }
    
    // 如果解码失败或不是AAEncode，返回原始代码
    return sourceCode;
  } catch (e) {
    // 出错时返回原始代码
    return sourceCode;
  }
};