const fs = require('fs')
const PluginCommon = require('./plugin/common.js')
const PluginJjencode = require('./plugin/jjencode.js')
const PluginSojson = require('./plugin/sojson.js')
const PluginSojsonV7 = require('./plugin/sojsonv7.js')
const PluginObfuscator = require('./plugin/obfuscator.js')
const PluginConfuser = require('./plugin/confuser.js')
const PluginAwsc = require('./plugin/awsc.js')
const PluginPart2AI = require('./plugin/part2ai.js')
const PluginAAencode = require('./plugin/aaencode.js')
const PluginJSFuck = require('./plugin/jsfuck.js')

// 读取参数
let encodeFile = 'input.js'
let decodeFile = 'output.js'
let pluginType = '' // 用于存储通过-t参数指定的插件类型

// 解析命令行参数
for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '-i' && i + 1 < process.argv.length) {
    encodeFile = process.argv[i + 1]
    i++
  } else if (process.argv[i] === '-o' && i + 1 < process.argv.length) {
    decodeFile = process.argv[i + 1]
    i++
  } else if (process.argv[i] === '-t' && i + 1 < process.argv.length) {
    pluginType = process.argv[i + 1]
    i++
  }
}

console.log(`输入: ${encodeFile}`)
console.log(`输出: ${decodeFile}`)
if (pluginType) console.log(`指定插件: ${pluginType}`)

// 读取源代码
const sourceCode = fs.readFileSync(encodeFile, { encoding: 'utf-8' })

let processedCode = sourceCode
let pluginUsed = ''

// 如果指定了插件类型，则只使用指定的插件
if (pluginType) {
  switch (pluginType.toLowerCase()) {
    case 'obfuscator':
      processedCode = PluginObfuscator(sourceCode)
      pluginUsed = 'obfuscator'
      break
    case 'sojson':
      processedCode = PluginSojson(sourceCode)
      pluginUsed = 'sojson'
      break
    case 'sojsonv7':
      processedCode = PluginSojsonV7(sourceCode)
      pluginUsed = 'sojsonv7'
      break
    case 'jjencode':
      processedCode = PluginJjencode(sourceCode)
      pluginUsed = 'jjencode'
      break
    case 'awsc':
      processedCode = PluginAwsc(sourceCode)
      pluginUsed = 'awsc'
      break
    case 'part2ai':
      processedCode = PluginPart2AI(sourceCode)
      pluginUsed = 'part2ai'
      break
    case 'aaencode': // 添加AAencode插件支持
      processedCode = PluginAAencode(sourceCode)
      pluginUsed = 'aaencode'
      break
    default:
      console.log(`未知的插件类型: ${pluginType}，将使用所有插件尝试解码`)
      pluginType = '' // 重置为空，使用所有插件
  }
}

// 如果没有指定插件类型，或者指定的插件处理结果与源代码相同，则尝试所有插件
if (!pluginType || processedCode === sourceCode) {
  // 循环尝试不同的插件，直到源代码与处理后的代码不一致
  const plugins = [
    { name: 'aaencode', plugin: PluginAAencode }, // 添加AAencode插件到列表
    { name: 'part2ai', plugin: PluginPart2AI },
    { name: 'obfuscator', plugin: PluginObfuscator },
    { name: 'sojsonv7', plugin: PluginSojsonV7 },
    { name: 'sojson', plugin: PluginSojson },
    { name: 'awsc', plugin: PluginAwsc },
    { name: 'jjencode', plugin: PluginJjencode },
    { name: 'common', plugin: PluginCommon } // 最后一次使用通用插件
  ]

  for (let plugin of plugins) {
    if (sourceCode.indexOf("smEcV") != -1) {
      break
    }
    try {
      const code = plugin.plugin(sourceCode)
      if (code && code !== processedCode) {
        processedCode = code
        pluginUsed = plugin.name
        break
      }
    } catch (error) {
      console.error(`插件 ${plugin.name} 处理时发生错误: ${error.message}`)
      // 继续循环尝试下一个插件
      continue
    }
  }
}

let time = new Date()
if (processedCode !== sourceCode) {
  // 输出代码
  fs.writeFile(
    decodeFile,
    "//" + time + '\n' +
    "//Base:https://github.com/echo094/decode-js" + '\n' +
    "//Modify:https://github.com/smallfawn/decode_action" + '\n' +
    processedCode,
    (err) => {
      if (err) throw err
      console.log(`使用插件 ${pluginUsed} 成功处理并写入文件 ${decodeFile}`)
    }
  )
} else {
  console.log(`所有插件处理后的代码与原代码一致，未写入文件。`)
}
