/**
 * AAEncode 解码插件 - CommonJS 版（适配 require + plugin.plugin(code) 调用）
 * 作者：Mikephie
 */

const { VM } = require('vm2');

// 判断是否为 AAEncode
function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code) && /(function|\['_'\]|\(ﾟДﾟ\))/.test(code);
}

// 提取字符串
function extractFinalString(code) {
  const patterns = [
    /\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(\s*['"]([\s\S]+?)['"]\s*\)/,
    /\(['"]([^'"]+)['"]\)\s*;?\s*$/ // fallback
  ];
  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

// 沙盒执行
function safeExec(code) {
  const vm = new VM({
    timeout: 3000,
    sandbox: {}
  });
  try {
    return vm.run(code);
  } catch (e) {
    console.warn('[AAEncode] 沙盒执行失败:', e);
    return null;
  }
}

// 解包逻辑
function unpack(code) {
  const str = extractFinalString(code);
  if (str) return str;

  let result = '';
  const fakeEval = (inner) => {
    result = inner;
    return inner;
  };

  let modifiedCode = code.replace(/eval\s*\(/g, 'fakeEval(')
                         .replace(/\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(/g, 'fakeEval(');

  safeExec(`const fakeEval=${fakeEval.toString()}; ${modifiedCode}`);

  return result || code;
}

// 递归解包
function recursiveUnpack(code, depth = 0) {
  if (depth > 10) return code;
  console.log(`[AAEncode] 正在进行第 ${depth + 1} 层解码...`);
  const res = unpack(code);
  if (res && res !== code && isAAEncode(res)) {
    return recursiveUnpack(res, depth + 1);
  }
  return res;
}

// 主处理函数
function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code;
  }
  console.log('[AAEncode] 检测到 AAEncode 混淆，开始解码...');
  return recursiveUnpack(code);
}

// 导出 CommonJS 兼容格式（plugin.plugin 调用）
module.exports = {
  plugin: decodeAAencode
};