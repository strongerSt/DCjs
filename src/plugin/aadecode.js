/**
 * AAEncode 自动递归解码插件 - Node.js 专业版
 * 自动解 N 层，直到明文
 */

const { VM } = require('vm2')

function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

function extractFinalString(code) {
  const patterns = [
    /\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(\s*['"]([\s\S]+?)['"]\s*\)/,
    /\(['"]([^'"]+)['"]\)\s*;?\s*$/,
    /return\s+['"]([^'"]+)['"]\s*;/,
    /document\.write\s*\(\s*['"]([\s\S]+?)['"]\s*\)/
  ]
  for (const pattern of patterns) {
    const match = code.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

function safeExec(code) {
  const vm = new VM({
    timeout: 3000,
    sandbox: {}
  })
  try {
    return vm.run(code)
  } catch (e) {
    console.warn('[AAEncode] 沙盒执行失败:', e.message)
    return null
  }
}

function unpack(code) {
  const str = extractFinalString(code)
  if (str) return str

  let result = ''
  const fakeEval = (inner) => { result = inner; return inner }

  let modifiedCode = code.replace(/eval\s*\(/g, 'fakeEval(')
                         .replace(/\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(/g, 'fakeEval(')

  safeExec(`const fakeEval=${fakeEval.toString()}; ${modifiedCode}`)

  return result || code
}

function recursiveUnpack(code, depth = 0) {
  if (depth > 10) return code

  console.log(`[AAEncode] 正在进行第 ${depth + 1} 层解码...`)

  const res = unpack(code)

  if (res && res !== code) {
    if (/eval\(function/.test(res)) {
      console.log('[AAEncode] 检测到 eval(function...) 自动递归解码下一层')
      return recursiveUnpack(res, depth + 1)
    }
    if (isAAEncode(res)) {
      console.log('[AAEncode] 检测到 AAEncode 混淆，继续解码')
      return recursiveUnpack(res, depth + 1)
    }
    return res
  }
  return code
}

function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code
  }

  console.log('[AAEncode] 检测到 AAEncode 混淆，开始解码...')
  const result = recursiveUnpack(code)

  if (!result || result.trim() === '') {
    console.log('[AAEncode] 解码结果为空，自动 fallback 返回原始代码')
    return code
  }

  console.log('[AAEncode] 成功提取最终明文，结束')
  return result
}

module.exports = decodeAAencode