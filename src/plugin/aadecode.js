/**
 * AADecode插件 - 用于解码日式表情符号加密的JavaScript
 */

// 创建一个对象来存放插件函数
const PluginAADecode = {};

// 定义plugin方法
PluginAADecode.plugin = function(sourceCode) {
  // 如果输入不是字符串，直接返回
  if (typeof sourceCode !== 'string') {
    return sourceCode;
  }
  
  // 检查是否可能是AAEncode编码
  if (!isAAEncoded(sourceCode)) {
    return sourceCode;
  }
  
  try {
    // 尝试解码
    const result = decode(sourceCode);
    
    // 如果解码成功且结果不同于原代码，返回解码结果
    if (result && result !== sourceCode) {
      return result;
    }
    
    // 默认返回原代码
    return sourceCode;
  } catch (e) {
    // 发生错误时返回原代码
    return sourceCode;
  }
};

// 检查是否是AAEncode编码
function isAAEncoded(code) {
  // AAEncode特征字符
  const markers = [
    'ﾟωﾟ',
    'ﾟДﾟ',
    'ﾟΘﾟ',
    'ﾟｰﾟ'
  ];
  
  // 检查是否包含至少2个特征字符
  let count = 0;
  for (const marker of markers) {
    if (code.includes(marker)) {
      count++;
    }
  }
  
  return count >= 2;
}

// 解码AAEncode编码
function decode(code) {
  try {
    // 创建一个安全的执行环境
    const sandbox = `
      var c = '';
      var document = {
        write: function(str) { c += str; }
      };
      var window = { document: document };
      
      try {
        ${code}
        return c;
      } catch(e) {
        return null;
      }
    `;
    
    // 执行沙箱代码
    const result = new Function(sandbox)();
    
    if (result && typeof result === 'string' && result.length > 0) {
      return result;
    }
    
    // 尝试其他方法：提取字符串
    const strMatch = code.match(/c\s*=\s*(['"])(.*?)\1/);
    if (strMatch && strMatch[2]) {
      return strMatch[2];
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

// 导出插件对象
module.exports = PluginAADecode;