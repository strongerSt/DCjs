/**
 * AAEncode 解码插件（完整源码还原版）
 * 适配 MITM Hook 脚本 / 普通 JS / 规则脚本
 * 输出完整 JavaScript 源码
 */

const { VM } = require('vm2')

// 判断是否为 AAEncode 混淆
function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

// 沙盒执行，仅捕获 document.write 或 console.log 内容作为源码
function safeSimulateOutput(code) {
  let result = ''

  const vm = new VM({
    timeout: 3000,
    sandbox: {
      window: {},
      document: {
        write: (str) => { result += str }
      },
      console: {
        log: (str) => { result += str },
        warn: () => {},
        error: () => {}
      },
      // 防止环境报错
      $response: { body: '{}' },
      $request: { url: '', method: 'GET', headers: {} },
      $done: () => {},
      $notify: () => {},
      $argument: '',
      setTimeout: () => {},
      setInterval: () => {}
    }
  })

  try {
    vm.run(code)
  } catch (e) {
    console.warn('[AAEncode] 沙盒执行失败:', e.message)
  }

  return result
}

// 插件主函数
function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code
  }

  console.log('[AAEncode] 检测到 AAEncode 混淆，开始自动还原完整 JS 源码...')

  const decoded = safeSimulateOutput(code)

  if (!decoded || decoded.trim() === '') {
    console.warn('[AAEncode] 执行后结果为空，自动 fallback 返回原始代码')
    return code
  }

  console.log('[AAEncode] 源码还原成功，输出完整内容')
  return decoded
}

module.exports = decodeAAencode