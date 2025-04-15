/**
 * AAEncode 解码插件 - 稳定兼容版
 * 逻辑优化：优先提取真实字符串，不执行代码
 * 最佳实践方案
 */

function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

function extractFinalString(code) {
  const patterns = [
    /\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(\s*['"]([\s\S]+?)['"]\s*\)/, // return "xxx"
    /\(['"]([^'"]+)['"]\)\s*;?\s*$/,                             // 末尾字符串
    /return\s+['"]([^'"]+)['"]\s*;/,                            // return 'xxx';
    /document\.write\s*\(\s*['"]([\s\S]+?)['"]\s*\)/            // document.write('xxx')
  ]
  for (const pattern of patterns) {
    const match = code.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code
  }

  console.log('[AAEncode] 检测到 AAEncode 混淆，开始解码...')

  const result = extractFinalString(code)

  if (!result || result.trim() === '') {
    console.log('[AAEncode] 无法提取字符串，自动 fallback 返回原始代码')
    return code
  }

  console.log('[AAEncode] 提取字符串成功，返回结果')
  return result
}

module.exports = decodeAAencode