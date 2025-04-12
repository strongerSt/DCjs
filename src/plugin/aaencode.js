// src/plugin/aaencode.js
const { VM } = require('vm2');

/**
 * 动态颜文字解混淆插件
 * 
 * 适用于多种变种的颜文字/表情符号混淆:
 * - 标准AAEncode (颜文字加密)
 * - JJencode变种
 * - 其他使用日文/中文字符作为变量的混淆
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
    
    // 执行单次解混淆
    const deobfuscated = deobfuscateSingle(result);
    
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
    { name: "AAEncode标准", regex: [/ﾟωﾟ/, /ﾟДﾟ/, /ﾟｰﾟ/, /ﾟΘﾟ/, /o\^_\^o/] },
    
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
        log: console.log,
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
      vm.run(sanitizedCode);
      console.log(`[颜文字解混淆] 执行完成，捕获了${capturedEvals.length}个eval/Function调用`);
      success = capturedEvals.length > 0;
    } catch (vmError) {
      // VM执行失败，记录错误但继续尝试其他方法
      console.error(`[颜文字解混淆] VM执行失败: ${vmError.message}`);
    }
    
    // 方法2：如果VM执行失败，尝试提取eval模式
    if (!success) {
      try {
        console.log('[颜文字解混淆] 尝试提取eval模式...');
        const evalPattern = extractEvalPattern(sanitizedCode);
        if (evalPattern) {
          capturedEvals.push({
            type: 'extracted',
            code: evalPattern
          });
          console.log('[颜文字解混淆] 成功提取eval模式');
          success = true;
        }
      } catch (extractError) {
        console.error(`[颜文字解混淆] 提取eval模式失败: ${extractError.message}`);
      }
    }
    
    // 方法3：通用模式匹配提取（如果前两种方法失败）
    if (!success && capturedEvals.length === 0) {
      try {
        console.log('[颜文字解混淆] 尝试通用模式提取...');
        const genericPattern = extractGenericPattern(sanitizedCode);
        if (genericPattern) {
          capturedEvals.push({
            type: 'generic',
            code: genericPattern
          });
          console.log('[颜文字解混淆] 成功提取通用模式');
          success = true;
        }
      } catch (genericError) {
        console.error(`[颜文字解混淆] 通用模式提取失败: ${genericError.message}`);
      }
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
 * 预处理混淆代码，处理特殊字符问题
 * @param {string} code - 原始混淆代码
 * @returns {string} - 处理后的代码
 */
function sanitizeCode(code) {
  // 修复已知的问题字符
  let sanitized = code;
  
  // 修复已知的问题字符和模式
  const replacements = [
    // 修复"iﾉ"问题 - 这是导致"Unexpected identifier 'iﾉ'"错误的原因
    { pattern: /(ﾟωﾟ)i iﾉ/g, replacement: "$1i_i" },
    { pattern: /iﾉ/g, replacement: "i_i" },
    
    // 修复其他常见问题字符
    { pattern: /([^_a-zA-Z0-9])\s+([^_a-zA-Z0-9])/g, replacement: "$1$2" },
    { pattern: /\(ﾟΘﾟ\)\s*=\s*\(o\^_\^o\)/g, replacement: "(ﾟΘﾟ)=(o^_^o)" },
    
    // JJEncode特定模式
    { pattern: /\$\{[^}]*\}/g, replacement: match => match.replace(/\s+/g, '') },
    
    // 移除注释和不必要的空格
    { pattern: /\/\*[\s\S]*?\*\//g, replacement: "" },
    { pattern: /\/\/[^\n]*\n/g, replacement: "\n" }
  ];
  
  // 应用替换
  for (const { pattern, replacement } of replacements) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  
  return sanitized;
}

/**
 * 提取颜文字混淆中的eval模式
 * @param {string} code - 混淆代码
 * @returns {string|null} - 提取的eval内容
 */
function extractEvalPattern(code) {
  // 尝试多种提取模式
  const patterns = [
    // 标准AAEncode eval模式
    {
      regex: /\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\]\s*\(\s*(.+?)\s*\)\s*\(\s*['"]?_['"]?\s*\)/,
      format: (match) => `(function(){${match[1]}})()`
    },
    // 另一种AAEncode模式
    {
      regex: /\(ﾟoﾟ\)\s*\(\s*(.+?)\s*\)/,
      format: (match) => `(function(){${match[1]}})()`
    },
    // 通用eval模式
    {
      regex: /eval\s*\(\s*([^)]+)\s*\)/,
      format: (match) => match[1]
    },
    // 变量赋值模式
    {
      regex: /var\s+_\s*=\s*(.+?);(?!\s*var\s+_)/,
      format: (match) => match[1]
    },
    // JJEncode常见模式
    {
      regex: /\$\s*=~\s*\[\]\s*;\s*\$\s*=\s*\{[^}]+\}\s*;\s*\$\._\s*=\s*([^;]+)/,
      format: (match) => `(function(){return ${match[1]}})()`
    },
    // 另一种JJEncode模式
    {
      regex: /\(\s*\+\s*\(\s*[^)]+\s*\)\s*\+\s*\(\s*([^)]+)\s*\)\s*\)\s*\(/,
      format: (match) => match[1]
    }
  ];
  
  // 尝试每种模式
  for (const pattern of patterns) {
    const match = code.match(pattern.regex);
    if (match && match[1]) {
      return pattern.format(match);
    }
  }
  
  // 如果以上模式都失败，尝试找到最后的return语句或函数调用
  const returnMatch = code.match(/return\s+([^;]+);[^;]*$/);
  if (returnMatch && returnMatch[1]) {
    return returnMatch[1];
  }
  
  // 尝试找到包含 function 的最长字符串
  const functionMatches = code.match(/function\s*\([^)]*\)\s*\{[^}]*\}/g);
  if (functionMatches && functionMatches.length > 0) {
    // 找出最长的函数定义
    let longest = functionMatches[0];
    for (const match of functionMatches) {
      if (match.length > longest.length) {
        longest = match;
      }
    }
    return longest;
  }
  
  return null;
}

/**
 * 通用模式提取（用于其他混淆变种）
 * @param {string} code - 混淆代码
 * @returns {string|null} - 提取的代码内容
 */
function extractGenericPattern(code) {
  // 尝试不同的通用提取策略
  
  // 1. 尝试找到代码中的最后一个函数调用
  const callMatch = code.match(/\w+\([^)]*\)\s*;?\s*$/);
  if (callMatch) {
    return callMatch[0];
  }
  
  // 2. 尝试找到代码中的大段字符串构建
  const stringBuilds = code.match(/(['"])(?:\\.|[^\\])*?\1\s*\+\s*(['"])(?:\\.|[^\\])*?\2/g);
  if (stringBuilds && stringBuilds.length > 0) {
    // 找到最长的字符串构建
    let longest = stringBuilds[0];
    for (const match of stringBuilds) {
      if (match.length > longest.length) {
        longest = match;
      }
    }
    return `(function() { return ${longest}; })()`;
  }
  
  // 3. 尝试找到大括号包含的最大块
  const blockMatch = findLargestBlock(code);
  if (blockMatch) {
    return blockMatch;
  }
  
  return null;
}

/**
 * 查找代码中最大的代码块
 * @param {string} code - 混淆代码
 * @returns {string|null} - 最大的代码块
 */
function findLargestBlock(code) {
  let maxLength = 0;
  let largestBlock = null;
  let stack = [];
  let blockStart = -1;
  
  // 查找最大的匹配括号块
  for (let i = 0; i < code.length; i++) {
    if (code[i] === '{') {
      if (stack.length === 0) {
        blockStart = i;
      }
      stack.push('{');
    } else if (code[i] === '}') {
      if (stack.length > 0) {
        stack.pop();
        if (stack.length === 0) {
          const blockLength = i - blockStart + 1;
          if (blockLength > maxLength) {
            maxLength = blockLength;
            largestBlock = code.substring(blockStart, i + 1);
          }
        }
      }
    }
  }
  
  return largestBlock;
}

/**
 * 清理解混淆后的代码，使其更易读
 * @param {string} code - 解混淆后的代码
 * @returns {string} - 清理后的代码
 */
function cleanupDeobfuscatedCode(code) {
  // 替换常见的颜文字/表情符号变量
  let cleaned = code;
  
  // 自动检测并创建替换表
  const replacements = [];
  
  // 添加已知的AAEncode模式
  const knownPatterns = [
    { pattern: /(ﾟωﾟﾉ)(?!\s*['"])/g, replacement: "emoji_omega" },
    { pattern: /(ﾟｰﾟ)(?!\s*['"])/g, replacement: "emoji_dash" },
    { pattern: /(ﾟΘﾟ)(?!\s*['"])/g, replacement: "emoji_theta" },
    { pattern: /(ﾟДﾟ)(?!\s*['"])/g, replacement: "emoji_d" },
    { pattern: /(o\^_\^o)(?!\s*['"])/g, replacement: "emoji_happy" },
    { pattern: /(c\^_\^o)(?!\s*['"])/g, replacement: "emoji_c_happy" },
    { pattern: /(ﾟoﾟ)(?!\s*['"])/g, replacement: "emoji_o" },
    { pattern: /(ﾟεﾟ)(?!\s*['"])/g, replacement: "emoji_epsilon" }
  ];
  
  replacements.push(...knownPatterns);
  
  // 动态查找其他可能的颜文字变量
  const emojiVariables = cleaned.match(/[^\x00-\x7F]+(?=\s*[=\[\(])/g);
  if (emojiVariables) {
    const uniqueEmojis = [...new Set(emojiVariables)];
    
    uniqueEmojis.forEach((emoji, index) => {
      // 检查是否已经在已知模式中
      const alreadyExists = knownPatterns.some(p => 
        p.pattern.toString().includes(emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      );
      
      if (!alreadyExists) {
        const escapedEmoji = emoji.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        replacements.push({
          pattern: new RegExp(`(${escapedEmoji})(?!\\s*['"])`, 'g'),
          replacement: `emoji_var_${index}`
        });
      }
    });
  }
  
  // 应用替换
  for (const { pattern, replacement } of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }
  
  // 尝试找到并修复常见的混淆模式
  cleaned = cleaned.replace(/\(\s*emoji_[a-z_]+\s*\)\s*\[\s*['"]_['"]\s*\]/g, "eval");
  
  return cleaned;
}

// 直接导出函数
module.exports = aaencodePlugin;