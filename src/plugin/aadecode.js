/**
 * 极简版 AADecode 插件
 * 基于 jamtg 的 aadecode 实现核心功能
 */

// 直接导出处理函数
module.exports = function(sourceCode) {
  // 基本检查
  if (typeof sourceCode !== 'string') {
    return sourceCode;
  }
  
  // 检查是否是 AAEncode 格式
  if (!sourceCode.includes('ﾟωﾟ') && !sourceCode.includes('ﾟДﾟ')) {
    return sourceCode;
  }
  
  try {
    // 简单的解码尝试
    const sandbox = `
      var c = '';
      var document = {
        write: function(str) { c += str; }
      };
      var window = { document: document };
      
      try {
        ${sourceCode}
        return c;
      } catch(e) {
        return null;
      }
    `;
    
    const result = new Function(sandbox)();
    
    if (result && typeof result === 'string' && result.length > 0 && result !== sourceCode) {
      return result;
    }
    
    // 备用：尝试提取字符串
    const strMatch = sourceCode.match(/c\s*=\s*(['"])(.*?)\1/);
    if (strMatch && strMatch[2]) {
      return strMatch[2];
    }
    
    return sourceCode;
  } catch (e) {
    return sourceCode;
  }
};