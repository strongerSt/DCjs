/**
 * AADecode插件 - 用于解码日式表情符号加密的JavaScript
 * 基于jamtg的aadecode实现
 */

// 检查是否是AAEncode加密的代码
function isAAEncoded(code) {
  if (typeof code !== 'string') {
    return false;
  }
  
  // AAEncode的特征模式
  const patterns = [
    'ﾟωﾟ',
    'ﾟДﾟ',
    'ﾟΘﾟ',
    'ﾟｰﾟ',
    '(c^_^o)',
    '(o^_^o)',
    '(ﾟДﾟ)[',
    'ヽ(',
    'c="'
  ];
  
  // 检查是否包含这些特殊模式中的至少两个
  let matchCount = 0;
  for (const pattern of patterns) {
    if (code.includes(pattern)) {
      matchCount++;
    }
    if (matchCount >= 2) {
      return true;
    }
  }
  
  // 检查是否有大量的日文字符和特殊符号 (这是AAEncode的特点)
  const japaneseAndSymbolsCount = (code.match(/[ﾟωДΘｰ々（）ヽ・]/g) || []).length;
  const codeLength = code.length;
  
  // 如果日文字符和特殊符号比例超过5%，可能是AAEncode
  return japaneseAndSymbolsCount > 0 && japaneseAndSymbolsCount / codeLength > 0.05;
}

// 主解码函数
function AADecode(encryptedCode) {
  try {
    // 如果不是AAEncode格式，直接返回null
    if (!isAAEncoded(encryptedCode)) {
      return null;
    }
    
    // 构建一个安全的执行环境
    const sandbox = `
      // 设置AAEncode环境变量
      var ﾟωﾟ, _ﾟωﾟ, __ﾟωﾟ, ___ﾟωﾟ;
      var ﾟΘﾟ, _ﾟΘﾟ, __ﾟΘﾟ, ___ﾟΘﾟ;
      var ﾟｰﾟ, _ﾟｰﾟ, __ﾟｰﾟ, ___ﾟｰﾟ;
      var ﾟДﾟ, _ﾟДﾟ, __ﾟДﾟ, ___ﾟДﾟ;
      var o, c = '', oo, cc;
      var ﾟεﾟ, oﾟｰﾟo, ﾟωﾟﾉ = {};
      
      // 模拟document
      var document = { write: function(str) { c += str; } };
      var window = { document: document };
      
      // 尝试执行
      try {
        ${encryptedCode}
        // 尝试收集潜在的输出
        if (typeof c !== 'undefined' && c.length > 0) return c;
        if (typeof oﾟｰﾟo !== 'undefined' && typeof oﾟｰﾟo === 'string') return oﾟｰﾟo;
        return null;
      } catch(e) {
        // 如果直接执行失败，尝试替代方法
        try {
          // 寻找可能的自执行函数
          const execMatch = \`${encryptedCode}\`.match(/\\(([^\\(\\)]*(?:\\([^\\(\\)]*\\)[^\\(\\)]*)*?)\\)\\(\\)/);
          if (execMatch && execMatch[1]) {
            const result = new Function('return (' + execMatch[1] + ')();')();
            if (result && typeof result === 'string') return result;
          }
          
          // 尝试找到document.write语句
          const writeMatch = \`${encryptedCode}\`.match(/document\\.write\\((['"])([^\\1]*?)\\1\\)/);
          if (writeMatch && writeMatch[2]) {
            return writeMatch[2];
          }
          
          return null;
        } catch(ex) {
          return null;
        }
      }
    `;
    
    try {
      // 使用Function构造函数创建一个新的函数并执行
      const sandboxFn = new Function(sandbox);
      const result = sandboxFn();
      
      if (result && typeof result === 'string' && result.length > 0) {
        // 检查结果是否是有效的JavaScript
        try {
          new Function(result);
          return result;
        } catch (e) {
          // 如果不是有效的JavaScript，但确实解码出了内容，仍然返回结果
          if (result.length > 50) {
            return result;
          }
        }
      }
    } catch (e) {
      // 如果沙箱执行失败，尝试基础方法提取字符串
      const stringMatch = encryptedCode.match(/c\\s*=\\s*["']([^"']+)["']/);
      if (stringMatch && stringMatch[1]) {
        return stringMatch[1].replace(/\\\\(['"])/g, '$1');
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

// 模块导出
module.exports = function(sourceCode) {
  if (typeof sourceCode !== 'string') {
    return null;
  }
  
  // 尝试解码
  if (isAAEncoded(sourceCode)) {
    const decodedCode = AADecode(sourceCode);
    if (decodedCode && typeof decodedCode === 'string' && decodedCode !== sourceCode) {
      return decodedCode;
    }
  }
  
  // 如果不是AAEncode或解码失败，返回null
  return null;
};