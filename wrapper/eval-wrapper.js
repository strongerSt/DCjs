
// 根据环境确定全局对象
const globalObj = typeof window !== 'undefined' ? window : 
                  typeof global !== 'undefined' ? global : 
                  typeof self !== 'undefined' ? self : {};

// 保存原始的 eval 函数
const evalHolder = globalObj.eval || eval;

/**
 * 替换代码中的eval函数调用，捕获其参数
 * @param {string} code - 包含eval调用的代码
 * @returns {string} - 修改后的代码
 */
function replaceEvalWithCapture(code) {
  return code.replace(/eval\s*\(/g, '(function(x) { return x; })(');
}

/**
 * 解包eval加密的JavaScript代码
 * @param {string} code - 要解包的代码
 * @returns {string|null} - 解包后的代码或null（解包失败时）
 */
function unpack(code) {
  // 检查代码是否包含eval调用
  if (!code.includes('eval(') && !code.includes('eval (')) {
    return null;
  }
  
  try {
    // 替换eval调用为捕获函数
    const modifiedCode = replaceEvalWithCapture(code);
    
    // 使用Function构造器执行代码
    const result = new Function(`return ${modifiedCode}`)();
    
    // 递归解包多层eval嵌套
    if (typeof result === 'string' && result.includes('eval(')) {
      return unpack(result);
    }
    
    return result;
  } catch (error) {
    console.error('Eval解包错误:', error);
    
    // 备选方法：直接替换eval
    try {
      return code.replace(/eval\s*\(/g, '(');
    } catch (e) {
      console.error('备选解包方法也失败:', e);
      return null;
    }
  }
}

// 导出为ES Module格式
export default {
  plugin: unpack,
  unpack: unpack
};