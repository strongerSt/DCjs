const { VM } = require('vm2')

function isAAEncode(code) {
  return /ﾟωﾟﾉ\s*=/.test(code) && /(ﾟДﾟ|ﾟΘﾟ)/.test(code)
}

function safeExtractEvalContent(code) {
  let captured = ''

  const vm = new VM({
    timeout: 3000,
    sandbox: {
      eval: (str) => {
        captured = str
      },
      window: {},
      document: { write: () => {} },
      console: { log: () => {} },
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
    console.warn('[AAEncode] 捕获 eval 执行失败:', e.message)
  }

  return captured
}

function decodeAAencode(code) {
  if (!code || typeof code !== 'string' || !isAAEncode(code)) return code

  console.log('[AAEncode] 检测到 AAEncode 混淆，尝试捕获 eval 源码...')

  const decoded = safeExtractEvalContent(code)

  if (!decoded || decoded.trim() === '') {
    console.warn('[AAEncode] 没有捕获到源码，自动 fallback 原始代码')
    return code
  }

  console.log('[AAEncode] 捕获源码成功，输出 eval 还原内容')
  return decoded
}

module.exports = decodeAAencode