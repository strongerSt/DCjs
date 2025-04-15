/**
 * AAEncode 解码插件 - Node.js 最佳实践版
 * 作者：Mikephie
 * 适配：decode-js 项目 CommonJS 插件规范
 */

const { VM } = require('vm2')

// 判断是否 AAEncode
function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

// 提取字符串
function extractFinalString(code) {
  const patterns = [
    /\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(\s*['"]([\s\S]+?)['"]\s*\)/,
    /\(['"]([^'"]+)['"]\)\s*;?\s*$/
  ]
  for (const pattern of patterns) {
    const match = code.match(pattern)
    if (match && match[1]) return match[1]
  }
  return null
}

// 沙盒执行
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

// 解包逻辑
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

// 递归解包
function recursiveUnpack(code, depth = 0) {
  if (depth > 10) return code
  console.log(`[AAEncode] 正在进行第 ${depth + 1} 层解码...`)
  const res = unpack(code)
  if (res && res !== code && isAAEncode(res)) {
    return recursiveUnpack(res, depth + 1)
  }
  return res
}

// 主处理逻辑
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

  return result
}

// 符合 main.js 插件调用规范
module.exports = decodeAAencode