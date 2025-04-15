/**
 * AAEncode 解码插件（模拟浏览器执行环境）
 * 支持 document.write / console.log / atob 等
 * 专为仅一层 AAEncode 脚本适配
 */

const { VM } = require('vm2')

// 判断是否 AAEncode
function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

// 提取封装脚本体
function extractCodeBlock(code) {
  const match = code.match(/\(ﾟДﾟ\)\s*\[\s*['_']\s*\]\s*\(\s*['"]([\s\S]+?)['"]\s*\)/)
  return match ? match[1] : null
}

// 构造带浏览器兼容环境的沙盒执行器
function safeSimulateBrowser(code) {
  let result = ''

  const vm = new VM({
    timeout: 3000,
    sandbox: {
      window: {},
      document: {
        write: (str) => { result += str }
      },
      atob: (str) => Buffer.from(str, 'base64').toString('binary'),
      console: {
        log: (str) => { result += str },
        warn: () => {},
        error: () => {}
      }
    }
  })

  try {
    vm.run(code)
  } catch (e) {
    console.warn('[AAEncode] 沙盒执行失败:', e.message)
  }

  return result
}

// 主处理函数
function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code
  }

  console.log('[AAEncode] 检测到 AAEncode 混淆，开始解码...')

  const extracted = extractCodeBlock(code)

  if (!extracted) {
    console.warn('[AAEncode] 无法提取混淆主体，返回原始代码')
    return code
  }

  // 直接执行解码内容
  const decoded = safeSimulateBrowser(extracted)

  if (!decoded || decoded.trim() === '') {
    console.warn('[AAEncode] 执行后结果为空，可能为动态构造内容，返回原始代码')
    return code
  }

  console.log('[AAEncode] 解码成功，输出解密内容')
  return decoded
}

module.exports = decodeAAencode