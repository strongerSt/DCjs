/**
 * AADecode插件 - 用于解码日式表情符号加密的JavaScript
 * 基于jamtg的aadecode实现
 */

function AADecode(encryptedCode) {
  // 检查是否是AAEncode加密的代码
  if (!isAAEncoded(encryptedCode)) {
    return null;
  }

  try {
    // 标准的AAEncode格式通常以"ﾟωﾟﾉ = /"开头
    // 我们需要构建一个完整的JavaScript环境来执行这段代码
    const evalCode = `
      var document = {};
      var window = { document: document };
      
      // AAEncode使用的变量
      var ﾟωﾟ, _ﾟωﾟ, __ﾟωﾟ, ___ﾟωﾟ, ____ﾟωﾟ, _____ﾟωﾟ, ______ﾟωﾟ, _______ﾟωﾟ, ________ﾟωﾟ;
      var ﾟΘﾟ, _ﾟΘﾟ, __ﾟΘﾟ, ___ﾟΘﾟ, ____ﾟΘﾟ, _____ﾟΘﾟ, ______ﾟΘﾟ, _______ﾟΘﾟ;
      var ﾟｰﾟ, _ﾟｰﾟ, __ﾟｰﾟ, ___ﾟｰﾟ, ____ﾟｰﾟ, _____ﾟｰﾟ, ______ﾟｰﾟ, _______ﾟｰﾟ;
      var ﾟДﾟ, _ﾟДﾟ, __ﾟДﾟ, ___ﾟДﾟ, ____ﾟДﾟ, _____ﾟДﾟ, ______ﾟДﾟ, _______ﾟДﾟ;
      var oﾟｰﾟo, _oﾟｰﾟo, __oﾟｰﾟo, ___oﾟｰﾟo, ____oﾟｰﾟo, _____oﾟｰﾟo, ______oﾟｰﾟo;
      
      // 尝试获取结果
      var result = '';
      
      try {
        // 执行加密代码
        ${encryptedCode}
        
        // 通常AAEncode最后会将结果赋值给变量或者直接调用
        // 我们捕获这个结果
        if (typeof c !== 'undefined') result = c;
        if (typeof oﾟｰﾟo !== 'undefined' && typeof oﾟｰﾟo === 'string') result = oﾟｰﾟo;
      } catch (e) {
        // 如果解码过程出错，尝试提取表达式并直接执行
        try {
          // 尝试找到加密代码的主体部分
          const match = encryptedCode.match(/ﾟωﾟﾉ\\s*=\\s*\\/(.+?)\\/(.*)/);
          if (match && match[2]) {
            const evalExpr = match[2].trim();
            result = eval(evalExpr);
          }
        } catch (innerError) {
          console.error('AADecode内部解析错误:', innerError);
        }
      }
      
      return result;
    `;
    
    // 使用Function构造函数创建一个新的函数并执行
    try {
      const decodeFn = new Function(evalCode);
      const decodedResult = decodeFn();
      
      if (decodedResult && typeof decodedResult === 'string' && decodedResult.length > 0) {
        return decodedResult;
      }
      
      // 备用方法：直接提取括号内的内容并执行
      const startComment = encryptedCode.indexOf('/*');
      const endComment = encryptedCode.lastIndexOf('*/');
      
      if (startComment !== -1 && endComment !== -1 && startComment < endComment) {
        // 剥离注释
        encryptedCode = encryptedCode.substring(0, startComment) + encryptedCode.substring(endComment + 2);
      }
      
      // 找到可能的代码体
      const execMatch = encryptedCode.match(/\(([^]*)\)\(\);?$/);
      if (execMatch && execMatch[1]) {
        const execBody = execMatch[1];
        const execFn = new Function(`return (${execBody})();`);
        const execResult = execFn();
        
        if (execResult && typeof execResult === 'string') {
          return execResult;
        }
      }
      
      return null;
    } catch (e) {
      console.error('AADecode执行错误:', e);
      
      // 尝试第二种方法：从中提取JavaScript代码
      const codeMatches = encryptedCode.match(/\(c\s*=\s*(['"])(.+?)\1\)/);
      if (codeMatches && codeMatches[2]) {
        return codeMatches[2].replace(/\\(['"])/g, '$1');
      }
      
      return null;
    }
  } catch (error) {
    console.error('AADecode处理时发生错误:', error);
    return null;
  }
}

// 检查是否是AAEncode加密的代码
function isAAEncoded(code) {
  // AAEncode加密的代码通常包含这些特殊字符和模式
  const patterns = [
    'ﾟωﾟﾉ',
    'ᄒᄼ',
    'ﾟДﾟ',
    '(´ﾟｰﾟ',
    'ωﾟ)',
    '(╯°□°）╯︵',  // 常见的表情符号模式
    '(•ω•)',
    'ヽ(･ω･)/',
    '(ﾟДﾟ)'
  ];
  
  // 检查这段代码是否像AAEncode的格式
  if (typeof code !== 'string') {
    return false;
  }
  
  // 去除空白字符
  const trimmedCode = code.trim();
  
  // 检查是否包含这些特殊模式中的至少一个
  const hasPattern = patterns.some(pattern => trimmedCode.includes(pattern));
  
  // 检查是否有大量的日文字符和特殊符号 (这是AAEncode的特点)
  const japaneseAndSymbolsCount = (trimmedCode.match(/[ﾟωДΘｰ々（）ヽ・]/g) || []).length;
  const codeLength = trimmedCode.length;
  
  // 如果日文字符和特殊符号比例超过5%，可能是AAEncode
  return hasPattern || (japaneseAndSymbolsCount > 0 && japaneseAndSymbolsCount / codeLength > 0.05);
}

// 实现替代解码方法 (基于执行AAENCODE的原理)
function executeAAEncode(code) {
  try {
    // 提取可能的JavaScript表达式
    const execRegex = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)\(\)+/;
    const matches = code.match(execRegex);
    
    if (matches && matches[1]) {
      // 构造一个安全的执行环境
      const sandbox = `
        var result = '';
        try {
          result = (${matches[1]})();
          if (typeof result === 'function') {
            result = result.toString();
          }
        } catch(e) {
          result = "Error: " + e.message;
        }
        return result;
      `;
      
      const sandboxFn = new Function(sandbox);
      return sandboxFn();
    }
    
    return null;
  } catch (e) {
    console.error('执行AAEncode替代解码方法错误:', e);
    return null;
  }
}

module.exports = function(sourceCode) {
  if (isAAEncoded(sourceCode)) {
    // 首先尝试主要解码方法
    let decodedCode = AADecode(sourceCode);
    
    // 如果主要方法失败，尝试替代方法
    if (!decodedCode || decodedCode === sourceCode) {
      decodedCode = executeAAEncode(sourceCode);
    }
    
    // 如果解码成功且结果不同于源代码
    if (decodedCode && typeof decodedCode === 'string' && decodedCode !== sourceCode) {
      // 检查解码结果是否是有效的JavaScript
      try {
        // 尝试解析解码结果，看是否是有效的JavaScript
        new Function(decodedCode);
        return decodedCode;
      } catch (e) {
        console.error('AADecode结果不是有效的JavaScript:', e.message);
      }
    }
  }
  
  // 如果不是AAEncode或解码失败，返回null
  return null;
};