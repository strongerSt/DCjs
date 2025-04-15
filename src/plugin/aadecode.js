/**
 * 极简版AADecode插件
 */

// 创建插件对象
const PluginAADecode = {};

// 定义plugin方法
PluginAADecode.plugin = function(sourceCode) {
  // 如果不是字符串或不包含特征字符，直接返回原代码
  if (typeof sourceCode !== 'string' || 
      (!sourceCode.includes('ﾟДﾟ') && !sourceCode.includes('ﾟωﾟ'))) {
    return sourceCode;
  }
  
  try {
    // 使用简单的替换方法
    let t = sourceCode;
    t = t.replace(/\) \('_'\)/g, "");
    t = t.replace(/\(ﾟДﾟ\) \['_'\] \(/g, "return ");
    
    // 创建并执行函数
    var x = new Function(t);
    var r = x();
    
    // 如果有结果且不同于原代码，返回结果
    if (r && r !== sourceCode) {
      return r;
    }
    
    // 默认返回原代码
    return sourceCode;
  } catch (e) {
    // 出错时返回原代码
    return sourceCode;
  }
};

// 导出插件对象
module.exports = PluginAADecode;