const { VM } = require('vm2')

function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

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
      },
      $response: { body: '{}' }, // 防止报错
      $done: () => {} // 防止报错
    }
  })

  try {
    vm.run(code)
  } catch (e) {
    console.warn('[AAEncode] 沙盒执行失败:', e.message)
  }

  return result
}

function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) {
    return code
  }

  console.log('[AAEncode] 检测到 AAEncode 混淆，开始执行...')

  const decoded = safeSimulateBrowser(code)

  if (!decoded || decoded.trim() === '') {
    console.warn('[AAEncode] 执行后结果为空，自动 fallback 返回原始代码')
    return code
  }

  console.log('[AAEncode] 解码成功，输出结果')
  return decoded
}

module.exports = decodeAAencode