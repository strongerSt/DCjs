// src/plugin/aaencode.js
const { VM } = require('vm2');

/**
 * 增强的颜文字解混淆插件
 * 
 * 适用于多种变种的颜文字/表情符号混淆:
 * - 标准AAEncode (颜文字加密)
 * - JJencode变种
 * - 其他使用特殊Unicode字符作为变量的混淆
 * 
 * @param {string} code - 要解密的混淆代码
 * @returns {string|null} - 解密后的代码，如果失败则返回null
 */
function aaencodePlugin(code) {
  // 递归解混淆处理
  return recursiveDeobfuscate(code);
}

/**
 * 递归解混淆，处理嵌套的颜文字混淆
 * @param {string} code - 混淆代码
 * @param {number} maxDepth - 最大递归深度
 * @returns {string} - 解混淆后的代码
 */
function recursiveDeobfuscate(code, maxDepth = 3) {
  let result = code;
  let depth = 0;
  
  // 检测是否为颜文字混淆
  const detectionResult = detectObfuscationType(result);
  if (!detectionResult.isObfuscated) {
    return null;
  }
  
  console.log(`[颜文字解混淆] 检测到${detectionResult.type}混淆，开始解密`);
  
  // 递归解混淆过程
  while (depth < maxDepth) {
    console.log(`[颜文字解混淆] 进行第 ${depth + 1} 层解包...`);
    
    // 保存上一次的结果用于比较
    const prevResult = result;
    
    // 尝试多种解混淆方法
    let deobfuscated = null;
    
    // 方法1: 尝试使用分析提取
    deobfuscated = extractAndExecuteAAEncode(result);
    
    // 方法2: 如果分析提取失败，尝试沙箱执行
    if (!deobfuscated) {
      deobfuscated = deobfuscateSingle(result);
    }
    
    // 方法3: 如果前两种方法都失败，尝试模式匹配
    if (!deobfuscated) {
      deobfuscated = patternMatchDeobfuscate(result);
    }
    
    if (!deobfuscated || deobfuscated === prevResult) {
      if (depth === 0) {
        console.log('[颜文字解混淆] 解包失败');
        return null;
      }
      break; // 没有变化，停止递归
    }
    
    result = deobfuscated;
    depth++;
    
    // 检查结果是否仍然包含颜文字混淆特征
    const newDetection = detectObfuscationType(result);
    if (!newDetection.isObfuscated) {
      console.log('[颜文字解混淆] 已完成所有解混淆层级');
      break;
    } else {
      console.log(`[颜文字解混淆] 检测到下一层${newDetection.type}混淆`);
    }
  }
  
  // 清理结果中的颜文字/表情符号变量
  if (result) {
    console.log('[颜文字解混淆] 清理特殊字符变量...');
    result = cleanupDeobfuscatedCode(result);
  }
  
  return result;
}

/**
 * 检测混淆类型
 * @param {string} code - 输入代码
 * @returns {Object} - 包含isObfuscated和type字段的检测结果
 */
function detectObfuscationType(code) {
  // 检测不同类型的颜文字/表情符号混淆
  const patterns = [
    // AAEncode标准模式
    { name: "AAEncode标准", regex: [/ﾟωﾟ/, /ﾟДﾟ/, /ﾟｰﾟ/, /ﾟΘﾟ/, /o\^_\^o/, /c\^_\^o/] },
    
    // JJEncode特征
    { name: "JJEncode", regex: [/\$\+=~\[\]\(/, /\(\+\(/, /\)\)\(\)/] },
    
    // 其他中日文字符混淆
    { name: "颜文字变种", regex: [/[ぁ-ヶ]/, /[ｦ-ﾟ]/, /[゜-鿿]/, /[一-龥]/] },
    
    // 表情符号混淆
    { name: "表情符号", regex: [/[\u{1F300}-\u{1F6FF}]/u, /[\u{1F900}-\u{1F9FF}]/u] }
  ];
  
  // 检测每种模式
  for (const pattern of patterns) {
    let matchCount = 0;
    const threshold = Math.min(2, pattern.regex.length); // 至少匹配2个或全部模式
    
    for (const regex of pattern.regex) {
      if (regex.test(code)) {
        matchCount++;
      }
      
      // 如果已经达到阈值，不再继续检测
      if (matchCount >= threshold) {
        return {
          isObfuscated: true,
          type: pattern.name
        };
      }
    }
  }
  
  // 通用混淆特征检测（如果以上模式都未匹配）
  const generalPatterns = [
    /[^\x00-\x7F]{4,}/,  // 包含至少4个连续非ASCII字符
    /['"`]\s*\+\s*['"`]/g, // 字符串拼接模式
    /\w\['.*?'\]/g // 可能的字典访问模式
  ];
  
  for (const regex of generalPatterns) {
    if (regex.test(code)) {
      return {
        isObfuscated: true,
        type: "疑似颜文字/字符混淆"
      };
    }
  }
  
  return {
    isObfuscated: false,
    type: "未知"
  };
}

/**
 * 分析并提取标准AAEncode混淆
 * @param {string} code - 混淆代码
 * @returns {string|null} - 解密后的代码
 */
function extractAndExecuteAAEncode(code) {
  try {
    // 特别针对AAEncode的模式 - 动态识别而非硬编码
    const aaencodedPattern = /ﾟωﾟ[^;]*;[^;]*;[^;]*;[^;]*;[^;]*;/;
    
    if (!aaencodedPattern.test(code)) {
      return null;
    }
    
    console.log('[颜文字解混淆] 检测到AAEncode模式结构');
    
    // 寻找最终执行点 - 动态匹配而非硬编码
    const execPatterns = [
      /\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\]\s*\(\s*([^)]+)\s*\)\s*\(\s*['"]?_['"]?\s*\)/,
      /\(ﾟДﾟ\)\s*\['_'\]\s*\(\s*([^)]+)\s*\)\s*\('_'\)/,
      /\(ﾟoﾟ\)\s*\(\s*([^)]+)\s*\)/
    ];
    
    let mainExecMatch = null;
    let execParam = null;
    
    for (const pattern of execPatterns) {
      const match = code.match(pattern);
      if (match && match[1]) {
        mainExecMatch = match[0];
        execParam = match[1];
        console.log('[颜文字解混淆] 找到执行点:', mainExecMatch.substring(0, 30) + '...');
        break;
      }
    }
    
    if (!mainExecMatch) {
      console.log('[颜文字解混淆] 无法找到执行点');
      return null;
    }
    
    // 创建一个函数来解析混淆代码
    const analysis = analyzeAAEncode(code);
    if (!analysis) {
      return null;
    }
    
    // 提取关键变量映射
    const { symbolMap, evalFunction } = analysis;
    
    // 基于分析结果构建解密代码
    console.log('[颜文字解混淆] 提取到的符号映射数量:', Object.keys(symbolMap).length);
    
    // 修改代码以输出结果而不是执行
    const modifiedCode = code.replace(
      mainExecMatch,
      `console.log(${execParam});`
    );
    
    // 尝试在沙箱中执行修改后的代码
    const sandbox = {
      console: {
        log: (result) => {
          console.log('[颜文字解混淆] 捕获到执行结果');
          return result;
        }
      }
    };
    
    try {
      const vm = new VM({
        timeout: 5000,
        sandbox: sandbox
      });
      
      const result = vm.run(modifiedCode);
      if (result && typeof result === 'string' && result.length > 0) {
        console.log('[颜文字解混淆] 成功提取到解密结果');
        return result;
      }
    } catch (vmError) {
      console.error(`[颜文字解混淆] VM执行失败: ${vmError.message}`);
    }
    
    // 尝试使用重构方法
    try {
      console.log('[颜文字解混淆] 尝试重构AAEncode结构...');
      // 根据分析到的结构重构代码
      const reconstructedCode = reconstructAAEncodeResult(execParam, symbolMap);
      if (reconstructedCode && reconstructedCode.length > 0) {
        console.log('[颜文字解混淆] 成功重构AAEncode结果');
        return reconstructedCode;
      }
    } catch (recError) {
      console.error(`[颜文字解混淆] 重构失败: ${recError.message}`);
    }
    
    return null;
  } catch (error) {
    console.error(`[颜文字解混淆] 提取AAEncode出错: ${error.message}`);
    return null;
  }
}

/**
 * 尝试重构AAEncode的执行结果
 * @param {string} expr - 执行表达式
 * @param {Object} symbolMap - 符号映射
 * @returns {string|null} - 重构的结果
 */
function reconstructAAEncodeResult(expr, symbolMap) {
  // 这个函数尝试通过分析执行表达式模拟重构结果
  // 注意：这是高级解析，可能无法处理所有情况
  
  try {
    // 提取表达式中的字符或操作符
    const parts = [];
    const exprParts = expr.split(/[\+\-\(\)]/);
    
    for (const part of exprParts) {
      const trimmed = part.trim();
      if (!trimmed) continue;
      
      // 查找对应的符号并尝试转换
      if (trimmed in symbolMap) {
        parts.push(symbolMap[trimmed].value);
      } else {
        // 可能是直接值
        for (const key in symbolMap) {
          const symbol = symbolMap[key].symbol;
          if (trimmed.includes(symbol)) {
            parts.push(trimmed.replace(symbol, symbolMap[key].value));
            break;
          }
        }
      }
    }
    
    // 检查是否可能是解密后的脚本
    if (parts.length > 0) {
      // 尝试提取有意义的部分
      const scriptPatterns = [
        /function\s*\([^)]*\)\s*\{[\s\S]*?}/g,
        /var\s+\w+\s*=\s*\{[\s\S]*?\}/g,
        /if\s*\([^)]*\)\s*\{[\s\S]*?\}/g
      ];
      
      for (const pattern of scriptPatterns) {
        const matches = parts.join(' ').match(pattern);
        if (matches && matches.length > 0) {
          // 查找最长的匹配
          let longest = matches[0];
          for (const m of matches) {
            if (m.length > longest.length) {
              longest = m;
            }
          }
          return longest;
        }
      }
    }
    
    // 如果无法确定脚本结构，尝试提取一些有意义的代码片段
    const codePatterns = [
      /\$request|\$response|\$done/,
      /JSON\.parse|JSON\.stringify/,
      /url\.indexOf|url\.match/
    ];
    
    const joinedParts = parts.join(' ');
    for (const pattern of codePatterns) {
      if (pattern.test(joinedParts)) {
        // 提取可能包含这些关键词的代码块
        const blockPattern = /\{[\s\S]*?\}/g;
        const blocks = joinedParts.match(blockPattern);
        if (blocks && blocks.length > 0) {
          // 找出最大的代码块
          let largest = blocks[0];
          for (const block of blocks) {
            if (block.length > largest.length) {
              largest = block;
            }
          }
          
          // 尝试构建一个有效的函数
          return `function main() ${largest}\n\nmain();`;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('[颜文字解混淆] 重构AAEncode结果失败:', error.message);
    return null;
  }
}

/**
 * 分析AAEncode混淆代码的结构
 * @param {string} code - 混淆代码
 * @returns {Object|null} - 分析结果
 */
function analyzeAAEncode(code) {
  try {
    // 提取变量定义 - 动态提取而非硬编码定义
    const symbolMap = {};
    
    // 动态分析代码中的变量定义
    const variablePattern = /\((ﾟ[^()\s]+ﾟ|o\^_\^o|c\^_\^o|[^\x00-\x7F]+)\)\s*=\s*([^;]+);/g;
    
    let match;
    while ((match = variablePattern.exec(code)) !== null) {
      const symbol = match[1];
      const value = match[2].trim();
      
      // 尝试识别变量类型/用途
      let key = `var_${Object.keys(symbolMap).length}`;
      
      // 特殊符号识别
      if (symbol === 'ﾟΘﾟ') key = 'theta';
      else if (symbol === 'ﾟｰﾟ') key = 'dash';
      else if (symbol === 'ﾟДﾟ') key = 'd';
      else if (symbol === 'o^_^o') key = 'happy';
      else if (symbol === 'c^_^o') key = 'c_happy';
      else if (symbol === 'ﾟωﾟﾉ') key = 'omega';
      else if (symbol === 'ﾟεﾟ') key = 'epsilon';
      else if (symbol === 'ﾟoﾟ') key = 'o';
      
      symbolMap[key] = {
        symbol,
        value
      };
    }
    
    // 尝试找到eval函数
    const evalPattern = /\((ﾟДﾟ)\)\s*\[\s*['"]?_['"]?\s*\]/;
    const evalMatch = code.match(evalPattern);
    let evalFunction = null;
    
    if (evalMatch) {
      evalFunction = evalMatch[0];
    }
    
    if (Object.keys(symbolMap).length === 0) {
      console.log('[颜文字解混淆] 无法提取符号映射');
      return null;
    }
    
    return {
      symbolMap,
      evalFunction
    };
  } catch (error) {
    console.error(`[颜文字解混淆] 分析AAEncode结构错误: ${error.message}`);
    return null;
  }
}

/**
 * 单次解混淆处理
 * @param {string} code - 要解密的混淆代码
 * @returns {string|null} - 解密后的代码，如果失败则返回null
 */
function deobfuscateSingle(code) {
  try {
    // 预处理代码，处理特殊字符问题
    const sanitizedCode = sanitizeCode(code);
    
    // 记录所有的eval调用
    const capturedEvals = [];
    
    // 创建沙盒环境
    const sandbox = {
      // 基本对象和函数
      Array, Object, String, Boolean, Number, RegExp, Date, Math,
      parseInt, parseFloat, isNaN, isFinite,
      
      // 控制台和定时器
      console: {
        log: (data) => {
          console.log(`[沙箱输出] ${typeof data === 'string' ? data : JSON.stringify(data)}`);
          return data;
        },
        error: console.error,
        warn: console.warn
      },
      setTimeout: (fn) => fn(),
      clearTimeout: () => {},
      
      // 拦截eval
      eval: function(evalCode) {
        capturedEvals.push({
          type: 'eval',
          code: evalCode
        });
        
        // 如果代码太长，只记录摘要
        const summary = evalCode.length > 50 
          ? evalCode.substring(0, 50) + '...' 
          : evalCode;
        console.log(`[颜文字解混淆] 捕获eval调用: ${summary}`);
        
        // 尝试执行，但捕获错误
        try {
          return new Function(evalCode)();
        } catch (e) {
          console.log(`[颜文字解混淆] Eval执行错误: ${e.message}`);
          return undefined;
        }
      },
      
      // 拦截Function构造函数
      Function: function() {
        const args = Array.from(arguments);
        const body = args.pop();
        const params = args;
        
        capturedEvals.push({
          type: 'Function',
          params: params,
          body: body
        });
        
        console.log(`[颜文字解混淆] 捕获Function构造: 参数数量=${params.length}`);
        
        // 返回一个包装函数
        return function() {
          try {
            return new Function(...params, body)(...arguments);
          } catch (e) {
            console.log(`[颜文字解混淆] Function执行错误: ${e.message}`);
            return undefined;
          }
        };
      },
      
      // 添加浏览器环境模拟
      window: {
        document: {
          createElement: () => ({}),
          getElementsByTagName: () => []
        },
        location: {
          href: 'https://example.com'
        }
      },
      document: {
        createElement: () => ({}),
        getElementsByTagName: () => []
      },
      
      // 针对QuantumultX的模拟
      $request: { url: "" },
      $response: { body: "{}" },
      $done: (obj) => {
        capturedEvals.push({
          type: '$done',
          code: typeof obj === 'string' ? obj : JSON.stringify(obj)
        });
        return obj;
      }
    };
    
    // 尝试多种解混淆方法
    let success = false;
    
    // 方法1：在VM沙盒中执行
    try {
      // 在VM中执行代码
      const vm = new VM({
        timeout: 5000,
        sandbox: sandbox,
        allowAsync: false
      });
      
      console.log('[颜文字解混淆] 在沙盒中执行代码...');
      
      // 为了捕获执行结果，可以修改代码添加一个返回值
      const modifiedCode = `
        let __result;
        try {
          __result = (function() {
            ${sanitizedCode}
            return undefined; // 默认返回值
          })();
        } catch(e) {
          __result = "Error: " + e.message;
        }
        __result;
      `;
      
      const vmResult = vm.run(modifiedCode);
      if (vmResult && typeof vmResult === 'string' && vmResult.length > 0) {
        capturedEvals.push({
          type: 'vmResult',
          code: vmResult
        });
      }
      
      console.log(`[颜文字解混淆] 执行完成，捕获了${capturedEvals.length}个eval/Function调用`);
      success = capturedEvals.length > 0;
    } catch (vmError) {
      // VM执行失败，记录错误但继续尝试其他方法
      console.error(`[颜文字解混淆] VM执行失败: ${vmError.message}`);
    }
    
    // 如果没有捕获到任何代码，返回null
    if (capturedEvals.length === 0) {
      console.log('[颜文字解混淆] 未捕获到任何动态代码');
      return null;
    }
    
    // 从捕获的eval中寻找最可能的解混淆结果
    let deobfuscatedCode = null;
    
    // 首先尝试找到有效的JavaScript
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body || '';
      
      if (evalCode && evalCode.length > 0) {
        try {
          // 验证是否是有效的JavaScript
          new Function(evalCode);
          deobfuscatedCode = evalCode;
          console.log(`[颜文字解混淆] 找到有效的JavaScript代码(#${i})`);
          break;
        } catch (e) {
          // 继续尝试下一个
        }
      }
    }
    
    // 如果找到了解混淆代码，返回它
    if (deobfuscatedCode) {
      console.log('[颜文字解混淆] 解密成功');
      return deobfuscatedCode;
    }
    
    // 如果没有找到有效的JavaScript，尝试返回最后一个非空的eval
    for (let i = capturedEvals.length - 1; i >= 0; i--) {
      const evalObj = capturedEvals[i];
      const evalCode = evalObj.code || evalObj.body || '';
      
      if (evalCode && evalCode.length > 0) {
        console.log('[颜文字解混淆] 未找到有效的JavaScript，返回最后一个非空捕获');
        return evalCode;
      }
    }
    
    console.log('[颜文字解混淆] 无法解密代码');
    return null;
  } catch (err) {
    console.error(`[颜文字解混淆] 解密过程中发生错误: ${err.message}`);
    return null;
  }
}

/**
 * 使用模式匹配方式解混淆
 * @param {string} code - 混淆代码
 * @returns {string|null} - 解混淆后的代码
 */
function patternMatchDeobfuscate(code) {
  try {
    console.log('[颜文字解混淆] 尝试使用模式匹配解密...');
    
    // 分析代码中的关键特征
    const features = analyzeCodeFeatures(code);
    console.log('[颜文字解混淆] 检测到的代码特征:', features);
    
    // 基于特征提取有意义的代码
    if (features.isAAEncode) {
      // 尝试提取AAEncode的执行表达式
      const execPattern = /\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\]\s*\(\s*([\s\S]+?)\s*\)\s*\(\s*['"]?_['"]?\s*\)/;
      const execMatch = code.match(execPattern);
      
      if (execMatch && execMatch[1]) {
        // 提取到了执行表达式
        const expressionCode = execMatch[1];
        console.log('[颜文字解混淆] 提取到执行表达式');
        
        // 尝试解析表达式
        const decodedExpression = analyzeAAExpression(expressionCode, code);
        if (decodedExpression) {
          return decodedExpression;
        }
      }
    }
    
    // 提取脚本配置信息 (适用于各种类型的脚本)
    const scriptConfig = extractScriptConfig(code);
    if (scriptConfig) {
      console.log('[颜文字解混淆] 提取到脚本配置信息');
      
      // 基于配置生成解密结果
      return generateScriptTemplate(scriptConfig, features);
    }
    
    // 尝试通用模式提取
    return extractGenericPattern(code);
  } catch (error) {
    console.error(`[颜文字解混淆] 模式匹配解密失败: ${error.message}`);
    return null;
  }
}

/**
 * 分析代码中的特征
 * @param {string} code - 混淆代码
 * @returns {Object} - 特征对象
 */
function analyzeCodeFeatures(code) {
  const features = {
    isAAEncode: false,
    isJJEncode: false,
    isQuantumultX: false,
    isLoon: false,
    isSurge: false,
    isStash: false,
    hasNetworkRequests: false,
    endpoints: [],
    obfuscationType: "unknown"
  };
  
  // 检测AAEncode
  if (/ﾟωﾟ.*?ﾟДﾟ.*?ﾟｰﾟ.*?ﾟΘﾟ/.test(code)) {
    features.isAAEncode = true;
    features.obfuscationType = "AAEncode";
  }
  
  // 检测JJEncode
  if (/\$\+=~\[\]\(/.test(code) || /\(\+\(/.test(code)) {
    features.isJJEncode = true;
    features.obfuscationType = "JJEncode";
  }
  
  // 检测QuantumultX
  if (/\[rewrite_local\]|\[mitm\]|\$(?:request|response|done)/.test(code)) {
    features.isQuantumultX = true;
  }
  
  // 检测Loon
  if (/\[Script\]|\[URL Rewrite\]|\[MITM\]/.test(code)) {
    features.isLoon = true;
  }
  
  // 检测Surge
  if (/\[Script\]|\[MITM\]|\[URL Rewrite\]/.test(code) && !features.isLoon) {
    features.isSurge = true;
  }
  
  // 检测Stash
  if (/rules:|proxies:|proxy-providers:/.test(code)) {
    features.isStash = true;
  }
  
  // 检测网络请求
  if (/https?:\/\/[^/\s]+\/[^\s]*/.test(code)) {
    features.hasNetworkRequests = true;
    
    // 提取API端点
    const urlPattern = /https?:\/\/[^/\s]+\/([^\s'"]*)/g;
    let match;
    while ((match = urlPattern.exec(code)) !== null) {
      if (match[1] && !features.endpoints.includes(match[1])) {
        features.endpoints.push(match[1]);
      }
    }
  }
  
  return features;
}

// 直接导出函数
module.exports = aaencodePlugin;

/**
 * 分析AA表达式
 * @param {string} expr - 表达式代码
 * @param {string} fullCode - 完整混淆代码
 * @returns {string|null} - 解析结果
 */
function analyzeAAExpression(expr, fullCode)

