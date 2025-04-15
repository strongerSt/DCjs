/**
 * AADecode插件 - 符合框架期望的结构
 */

// 创建一个带有plugin方法的对象
const PluginAADecode = {};

// 添加plugin方法
PluginAADecode.plugin = function(sourceCode) {
  // 基本检查
  if (typeof sourceCode !== 'string') {
    return sourceCode;
  }
  
  // 检查是否是AAEncode格式
  if (!(sourceCode.includes('ﾟωﾟ') || sourceCode.includes('ﾟДﾟ'))) {
    return sourceCode;
  }
  
  try {
    // 尝试解码
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
    
    return sourceCode;
  } catch (e) {
    return sourceCode;
  }
};

// 导出整个对象
module.exports = PluginAADecode;