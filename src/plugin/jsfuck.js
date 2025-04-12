/**
 * JSFuck解码器 - 通用JavaScript混淆解析引擎
 * 一个自适应的JSFuck及其变种解码器
 */

"use strict";

// 辅助函数
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function calculateEntropy(str) {
  const charCounts = {};
  for (const char of str) {
    charCounts[char] = (charCounts[char] || 0) + 1;
  }
  
  let entropy = 0;
  for (const count of Object.values(charCounts)) {
    const p = count / str.length;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

function safeBase64Decode(encoded) {
  if (!/^[A-Za-z0-9+/=]+$/.test(encoded)) {
    throw new Error('不是有效的Base64字符串');
  }
  
  try {
    if (typeof atob === 'function') {
      return atob(encoded);
    }
    
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(encoded, 'base64').toString('utf-8');
    }
    
    throw new Error('当前环境不支持Base64解码');
  } catch (error) {
    throw new Error(`Base64解码失败: ${error.message}`);
  }
}

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function isPrintableAscii(str) {
  return /^[\x20-\x7E]*$/.test(str);
}

// 沙箱执行环境
function isSafeToExecute(code) {
  const dangerousPatterns = [
    /\beval\s*\(/i,
    /\bFunction\s*\(/i,
    /\bnew\s+Function/i,
    /\bdocument\b/i,
    /\bwindow\b/i,
    /\blocation\b/i,
    /\bnavigator\b/i,
    /\bfetch\s*\(/i,
    /\bXMLHttpRequest\b/i,
    /\bWebSocket\b/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return false;
    }
  }
  
  if (code.length > 5000) {
    return false;
  }
  
  if (/^[\+\!\(\)\[\]]+$/.test(code.trim())) {
    return true;
  }
  
  let openBrackets = 0;
  let openParens = 0;
  let maxNesting = 0;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    if (char === '[') {
      openBrackets++;
    } else if (char === ']') {
      openBrackets = Math.max(0, openBrackets - 1);
    } else if (char === '(') {
      openParens++;
    } else if (char === ')') {
      openParens = Math.max(0, openParens - 1);
    }
    
    const currentNesting = openBrackets + openParens;
    maxNesting = Math.max(maxNesting, currentNesting);
  }
  
  if (maxNesting > 50) {
    return false;
  }
  
  return true;
}

function executeSandboxed(code, timeout) {
  timeout = timeout || 3000;
  
  if (!isSafeToExecute(code)) {
    throw new Error('代码不安全，拒绝执行');
  }
  
  return new Promise(function(resolve, reject) {
    const timeoutId = setTimeout(function() {
      reject(new Error('执行超时'));
    }, timeout);
    
    try {
      const result = Function(
        '"use strict";' +
        'const alert = function() {};' +
        'const confirm = function() {};' +
        'const prompt = function() {};' +
        'const eval = function() { throw new Error("不允许使用eval"); };' +
        'try {' +
        '  return ' + code + ';' +
        '} catch (e) {' +
        '  return { error: e.message };' +
        '}'
      )();
      
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

// 符号跟踪器
function SymbolsTracker() {
  this.symbolsCache = new Map();
}

SymbolsTracker.prototype.extractSymbols = function(code) {
  if (this.symbolsCache.has(code)) {
    return this.symbolsCache.get(code);
  }
  
  const symbols = {
    variables: {},
    functions: {},
    stringLiterals: [],
    numberLiterals: [],
    objectProperties: {},
    unidentified: []
  };
  
  try {
    this._extractVariables(code, symbols);
    this._extractFunctions(code, symbols);
    this._extractStringLiterals(code, symbols);
    this._extractNumberLiterals(code, symbols);
    this._extractObjectProperties(code, symbols);
    this._findSpecialStructures(code, symbols);
  } catch (error) {
    symbols.error = error.message;
  }
  
  this.symbolsCache.set(code, symbols);
  return symbols;
};

SymbolsTracker.prototype._extractVariables = function(code, symbols) {
  // var声明
  const varDeclarations = [];
  const varRegex = /var\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g;
  let match;
  
  while ((match = varRegex.exec(code)) !== null) {
    const name = match[1];
    const value = match[2];
    
    symbols.variables[name] = {
      type: 'var',
      initialValue: value.trim(),
      usageCount: 0
    };
  }
  
  // 查找颜文字变量
  this._findEmojiVariables(code, symbols);
  
  // 统计变量使用频率
  for (const varName of Object.keys(symbols.variables)) {
    const escapedName = escapeRegExp(varName);
    const regex = new RegExp('\\b' + escapedName + '\\b', 'g');
    const matches = code.match(regex);
    symbols.variables[varName].usageCount = matches ? matches.length : 0;
  }
};

SymbolsTracker.prototype._findEmojiVariables = function(code, symbols) {
  // 颜文字模式
  const emojiPatterns = [
    /(\(ﾟДﾟ\))\s*=\s*([^;]+);/g,
    /(\(o\^_\^o\))\s*=\s*([^;]+);/g,
    /(ﾟωﾟ\S*)\s*=\s*([^;]+);/g,
    /(ﾟΘﾟ\S*)\s*=\s*([^;]+);/g,
    /(\('_'\))\s*=\s*([^;]+);/g
  ];
  
  for (const pattern of emojiPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const name = match[1];
      const value = match[2];
      
      symbols.variables[name] = {
        type: 'emoji-var',
        initialValue: value.trim(),
        usageCount: 0
      };
    }
  }
  
  // 尝试动态识别其他颜文字变量
  const potentialEmojiRegex = /(\([^a-zA-Z0-9_$\s)(]+\))\s*=\s*([^;]+);/g;
  let match;
  
  while ((match = potentialEmojiRegex.exec(code)) !== null) {
    const name = match[1];
    const value = match[2];
    
    if (!symbols.variables[name]) {
      symbols.variables[name] = {
        type: 'potential-emoji-var',
        initialValue: value.trim(),
        usageCount: 0
      };
    }
  }
  
  // 统计使用频率
  for (const varName of Object.keys(symbols.variables)) {
    if (symbols.variables[varName].type === 'emoji-var' || 
        symbols.variables[varName].type === 'potential-emoji-var') {
      
      const escapedName = escapeRegExp(varName);
      const regex = new RegExp(escapedName, 'g');
      const matches = code.match(regex);
      symbols.variables[varName].usageCount = matches ? matches.length : 0;
    }
  }
};

SymbolsTracker.prototype._extractFunctions = function(code, symbols) {
  // 命名函数
  const funcRegex = /function\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)\s*\{/g;
  let match;
  
  while ((match = funcRegex.exec(code)) !== null) {
    const name = match[1];
    const params = match[2];
    
    symbols.functions[name] = {
      type: 'named-function',
      parameters: params.split(',').map(function(p) { return p.trim(); }).filter(function(p) { return p; }),
      usageCount: 0
    };
  }
};

SymbolsTracker.prototype._extractStringLiterals = function(code, symbols) {
  const stringPatterns = [
    /"(?:\\"|[^"])*"/g,
    /'(?:\\'|[^'])*'/g,
    /`(?:\\`|[^`])*`/g
  ];
  
  for (const pattern of stringPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const value = match[0];
      
      if (value.length > 3) {
        symbols.stringLiterals.push({
          value: value,
          index: match.index,
          length: value.length
        });
      }
    }
  }
  
  symbols.stringLiterals.sort(function(a, b) { 
    return b.length - a.length; 
  });
  
  if (symbols.stringLiterals.length > 100) {
    symbols.stringLiterals = symbols.stringLiterals.slice(0, 100);
  }
};

SymbolsTracker.prototype._extractNumberLiterals = function(code, symbols) {
  // 整数
  const integerRegex = /\b(\d+)\b/g;
  let match;
  
  while ((match = integerRegex.exec(code)) !== null) {
    const value = match[1];
    
    if (value.length >= 3) {
      symbols.numberLiterals.push({
        value: parseInt(value, 10),
        raw: value,
        type: 'integer'
      });
    }
  }
};

SymbolsTracker.prototype._extractObjectProperties = function(code, symbols) {
  // 对象属性
  const propRegex = /([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)/g;
  let match;
  
  while ((match = propRegex.exec(code)) !== null) {
    const obj = match[1];
    const prop = match[2];
    
    if (!symbols.objectProperties[obj]) {
      symbols.objectProperties[obj] = {
        properties: new Set(),
        type: 'object'
      };
    }
    
    symbols.objectProperties[obj].properties.add(prop);
  }
  
  // 将Set转换为数组
  for (const obj of Object.keys(symbols.objectProperties)) {
    symbols.objectProperties[obj].properties = 
      Array.from(symbols.objectProperties[obj].properties);
  }
};

SymbolsTracker.prototype._findSpecialStructures = function(code, symbols) {
  // JSFuck构造
  const jsFuckPatterns = [
    /\(!\[\]\+\[\]\)/g,
    /\[\]\[\+\[\]\]/g,
    /\+\!\+\[\]/g
  ];
  
  for (const pattern of jsFuckPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      symbols.unidentified.push({
        type: 'potential-jsfuck',
        value: match[0],
        index: match.index
      });
    }
  }
  
  // 检查是否有其他Unicode字符
  const unicodeChars = Array.from(code).filter(function(char) {
    const code = char.charCodeAt(0);
    return code > 127;
  });
  
  if (unicodeChars.length > 0) {
    const uniqueChars = Array.from(new Set(unicodeChars));
    symbols.unicodeChars = {
      count: unicodeChars.length,
      uniqueCount: uniqueChars.length,
      samples: uniqueChars.slice(0, 10)
    };
  }
};

// 模式识别器
function PatternRecognizer() {
  this.patternRegistry = new Map();
  this.signatureCache = new Map();
}

PatternRecognizer.prototype.identifyType = function(code) {
  // 计算代码特征向量
  const signature = this._computeSignature(code);
  
  // JSFuck变种检测
  if (signature.charEntropy > 4.5 && signature.symbolRatio.bracketsPct > 0.3) {
    if (signature.uniqueChars.size <= 8 && 
        signature.symbolRatio.bracketsPct + signature.symbolRatio.operatorsPct > 0.8) {
      return 'jsfuck-variant';
    }
  }
  
  // 颜文字特征检测
  if (signature.unicodeRanges.includes('CJK') || 
      signature.unicodeRanges.includes('Katakana') || 
      /ﾟ[ｰωΘДoﾉ]/.test(code)) {
    if (signature.symbolRatio.bracketsPct > 0.1) {
      return 'emoji-jsfuck';
    }
    return 'aaencode-variant';
  }
  
  // 混合型混淆
  if (signature.stringLiteralsPct < 0.05 && signature.fnCallNestingLevel > 3) {
    return 'mixed-obfuscation';
  }
  
  // 默认为通用混淆
  return 'general-obfuscation';
};

PatternRecognizer.prototype.extractPatterns = function(code, symbols) {
  const patterns = {
    stringConstruction: [],
    functionConstruction: [],
    controlFlow: [],
    variableMapping: {},
    recursivePatterns: [],
    encodedChunks: []
  };
  
  // 查找字符串构造模式
  this._findStringConstructionPatterns(code, patterns);
  
  // 提取可能的编码块
  patterns.encodedChunks = this._extractEncodedChunks(code);
  
  // 识别变量映射
  patterns.variableMapping = this._extractVariableMappings(code, symbols);
  
  return patterns;
};

PatternRecognizer.prototype._findStringConstructionPatterns = function(code, patterns) {
  // JSFuck风格的数字构造
  const digitPatterns = [
    { regex: /\+\[\]/g, value: '0', confidence: 0.95 },
    { regex: /\+\!\+\[\]/g, value: '1', confidence: 0.95 }
  ];
  
  for (const dp of digitPatterns) {
    if (dp.regex) {
      const matches = code.match(dp.regex);
      if (matches && matches.length > 0) {
        patterns.stringConstruction.push({
          type: 'digit-construction',
          regex: dp.regex,
          decodedValue: dp.value,
          confidence: dp.confidence,
          occurrences: matches.length
        });
      }
    }
  }
  
  // 检查重复的感叹号+方括号模式
  const exclamPattern = /(!+\[\]){2,}/g;
  let exclMatch;
  while ((exclMatch = exclamPattern.exec(code)) !== null) {
    const exclamCount = (exclMatch[0].match(/!/g) || []).length;
    patterns.stringConstruction.push({
      type: 'repeated-pattern',
      regex: new RegExp(escapeRegExp(exclMatch[0]), 'g'),
      decodedValue: String(exclamCount),
      confidence: 0.7,
      occurrences: 1
    });
  }
};

PatternRecognizer.prototype._extractEncodedChunks = function(code) {
  const chunks = [];
  
  // 基于模式特征提取可能的编码块
  const encodedPatterns = [
    // Base64类似模式
    /['"][A-Za-z0-9+/=]{20,}['"]/g,
    // 十六进制编码
    /\\x[0-9A-Fa-f]{2}/g,
    // Unicode编码
    /\\u[0-9A-Fa-f]{4}/g
  ];
  
  for (const pattern of encodedPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      const chunk = match[0];
      chunks.push({
        type: this._determineEncodingType(chunk, pattern),
        chunk: chunk,
        length: chunk.length,
        pattern: pattern.source
      });
    }
  }
  
  return chunks;
};

PatternRecognizer.prototype._determineEncodingType = function(chunk, matchedPattern) {
  const patternStr = matchedPattern.toString();
  
  if (/\\x[0-9A-Fa-f]{2}/.test(patternStr)) {
    return 'hex-encoding';
  }
  
  if (/\\u[0-9A-Fa-f]{4}/.test(patternStr)) {
    return 'unicode-encoding';
  }
  
  if (/[A-Za-z0-9+/=]{20,}/.test(patternStr)) {
    const base64Ratio = chunk.replace(/[^A-Za-z0-9+/=]/g, '').length / chunk.length;
    if (base64Ratio > 0.9) {
      return 'base64-encoding';
    }
  }
  
  return 'unknown-encoding';
};

PatternRecognizer.prototype._extractVariableMappings = function(code, symbols) {
  const mappings = {};
  
  // 提取变量用途
  const variableSymbols = symbols.variables || {};
  for (const varName in variableSymbols) {
    if (variableSymbols.hasOwnProperty(varName)) {
      const info = variableSymbols[varName];
      const purpose = this._inferVariablePurpose(varName, info.initialValue, code);
      
      mappings[varName] = {
        definition: info.initialValue,
        purpose: purpose,
        confidence: purpose === '未知目的' ? 0.3 : 0.7
      };
    }
  }
  
  return mappings;
};

PatternRecognizer.prototype._inferVariablePurpose = function(varName, definition, code) {
  // 基于颜文字变量名推断用途
  if (varName === '(ﾟДﾟ)') {
    return "主执行对象";
  } else if (varName === '(ﾟoﾟ)') {
    return "构造器字符串";
  } else if (varName === 'ﾟωﾟﾉ') {
    return "初始化变量";
  } else if (varName.includes('(ﾟｰﾟ)')) {
    return "辅助计数变量";
  } else if (varName.includes('(ﾟΘﾟ)')) {
    return "辅助索引变量";
  }
  
  // 分析变量名
  if (/^[_$]/.test(varName)) {
    return '可能的临时变量';
  }
  
  if (/^[a-z]$/.test(varName)) {
    return '可能的循环变量';
  }
  
  // 分析定义内容
  if (definition && definition.includes('function(')) {
    return '函数定义';
  }
  
  if (definition && definition.includes('new ')) {
    return '对象实例';
  }
  
  return '未知目的';
};

PatternRecognizer.prototype._computeSignature = function(code) {
  // 检查缓存
  if (this.signatureCache.has(code)) {
    return this.signatureCache.get(code);
  }
  
  // 计算基本统计
  const stats = {
    length: code.length,
    uniqueChars: new Set(code.split('')),
    charCounts: {},
    charEntropy: 0,
    symbolRatio: {
      bracketsPct: 0,
      operatorsPct: 0,
      punctuationPct: 0,
      alphanumericPct: 0
    },
    unicodeRanges: [],
    stringLiteralsPct: 0,
    fnCallNestingLevel: 0
  };
  
  // 计算字符频率
  for (const char of code) {
    stats.charCounts[char] = (stats.charCounts[char] || 0) + 1;
  }
  
  // 计算熵
  let entropy = 0;
  for (const count of Object.values(stats.charCounts)) {
    const p = count / code.length;
    entropy -= p * Math.log2(p);
  }
  stats.charEntropy = entropy;
  
  // 计算符号比例
  const brackets = (code.match(/[\(\)\[\]\{\}]/g) || []).length;
  const operators = (code.match(/[\+\-\*\/\%\!\=\&\|\^]/g) || []).length;
  const punctuation = (code.match(/[\,\;\.\:\?]/g) || []).length;
  const alphanumeric = (code.match(/[a-zA-Z0-9]/g) || []).length;
  
  stats.symbolRatio.bracketsPct = brackets / code.length;
  stats.symbolRatio.operatorsPct = operators / code.length;
  stats.symbolRatio.punctuationPct = punctuation / code.length;
  stats.symbolRatio.alphanumericPct = alphanumeric / code.length;
  
  // 检测Unicode范围
  if (/[\u0370-\u03FF]/.test(code)) stats.unicodeRanges.push('Greek');
  if (/[\u0400-\u04FF]/.test(code)) stats.unicodeRanges.push('Cyrillic');
  if (/[\u3000-\u303f\u3040-\u309f\u30a0-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(code)) {
    stats.unicodeRanges.push('CJK');
  }
  if (/[\u30A0-\u30FF]/.test(code)) stats.unicodeRanges.push('Katakana');
  
  // 字符串字面量百分比
  const stringMatchArray = code.match(/(['"])(?:\\\1|.)*?\1/g);
  const stringLiterals = stringMatchArray ? 
    stringMatchArray.reduce(function(acc, str) { return acc + str.length; }, 0) : 0;
  stats.stringLiteralsPct = stringLiterals / code.length;
  
  // 函数调用嵌套层级
  stats.fnCallNestingLevel = this._calculateNestingLevel(code);
  
  // 缓存并返回
  this.signatureCache.set(code, stats);
  return stats;
};

PatternRecognizer.prototype._calculateNestingLevel = function(code) {
  let maxNesting = 0;
  let currentNesting = 0;
  
  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    
    if (char === '(') {
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    } else if (char === ')') {
      currentNesting = Math.max(0, currentNesting - 1);
    }
  }
  
  return maxNesting;
};

PatternRecognizer.prototype.generateTransformations = function(patterns, symbols, decodedSegments) {
  const transformations = [];
  
  // 字符串解构转换
  const stringConstructionPatterns = patterns.stringConstruction || [];
  for (const pattern of stringConstructionPatterns) {
    if (pattern.confidence > 0.7) {
      transformations.push({
        type: 'string-deconstruction',
        pattern: pattern.regex,
        replacement: pattern.decodedValue,
        confidence: pattern.confidence
      });
    }
  }
  
  // 基于变量映射的转换
  const variableMappings = patterns.variableMapping || {};
  for (const varName in variableMappings) {
    if (variableMappings.hasOwnProperty(varName)) {
      const mapping = variableMappings[varName];
      if (mapping.purpose && mapping.confidence > 0.6) {
        transformations.push({
          type: 'variable-mapping',
          pattern: new RegExp(escapeRegExp(varName), 'g'),
          replacement: '/* ' + mapping.purpose + ' */',
          confidence: mapping.confidence
        });
      }
    }
  }
  
  // 从解码段提取转换
  decodedSegments = decodedSegments || [];
  for (const segment of decodedSegments) {
    if (segment.original && segment.decoded) {
      transformations.push({
        type: 'decoded-segment',
        pattern: new RegExp(escapeRegExp(segment.original), 'g'),
        replacement: segment.decoded,
        confidence: segment.confidence
      });
    }
  }
  
  return transformations;
};

// 执行分析器
function ExecutionAnalyzer(options) {
  this.options = {
    maxRecursionDepth: 10,
    safeExecution: false,
    maxExecutionTime: 3000
  };
  
  // 合并传入的选项
  if (options) {
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key];
      }
    }
  }
  
  this.executionState = null;
  this.decodingCache = new Map();
}

ExecutionAnalyzer.prototype.analyzeFlow = function(code, patterns, symbols) {
  const executionFlow = [];
  
  // 重置执行状态
  this.executionState = {
    depth: 0,
    visitedNodes: new Set(),
    currentPath: []
  };
  
  try {
    // 识别入口点
    const entryPoints = this._findEntryPoints(code, patterns, symbols);
    for (const entry of entryPoints) {
      executionFlow.push(Object.assign({
        type: 'entry-point'
      }, entry));
    }
    
    // 识别关键执行节点
    const keyNodes = this._identifyKeyNodes(code, patterns, symbols);
    for (const node of keyNodes) {
      executionFlow.push(Object.assign({
        type: 'key-node'
      }, node));
    }
  } catch (error) {
    executionFlow.push({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }
  
  return executionFlow;
};

ExecutionAnalyzer.prototype.decodeSegments = function(code, patterns, executionFlow) {
  const decodedSegments = [];
  
  try {
    // 检查缓存
    const cacheKey = this._generateCacheKey(code);
    if (this.decodingCache.has(cacheKey)) {
      return this.decodingCache.get(cacheKey);
    }
    
    // 解码字符串构造
    const decodedStrings = this._decodeStringConstructions(code, patterns);
    for (const segment of decodedStrings) {
      decodedSegments.push(segment);
    }
    
    // 解码特殊模式
    const specialDecodings = this._decodeSpecialPatterns(code);
    for (const segment of specialDecodings) {
      decodedSegments.push(segment);
    }
    
    // 尝试安全执行解码
    if (this.options.safeExecution) {
      const executionResults = this._safeExecuteDecode(code, patterns);
      for (const segment of executionResults) {
        decodedSegments.push(segment);
      }
    }
    
    // 缓存结果
    this.decodingCache.set(cacheKey, decodedSegments);
  } catch (error) {
    decodedSegments.push({
      type: 'error',
      message: error.message,
      stack: error.stack
    });
  }
  
  return decodedSegments;
};

ExecutionAnalyzer.prototype.attemptDecode = function(code, analysis) {
  const result = {
    original: code,
    decoded: null,
    decodedSegments: [],
    partiallyDecoded: null,
    transformations: [],
    success: false,
    error: null
  };
  
  try {
    // 提取可用的转换规则
    const transformations = analysis.transformations || [];
    result.transformations = transformations;
    
    if (transformations.length === 0) {
      result.error = "没有找到可用的转换规则";
      return result;
    }
    
    // 应用转换规则
    let transformedCode = code;
    const appliedTransformations = [];
    
    // 按置信度排序
    transformations.sort(function(a, b) {
      return (b.confidence || 0) - (a.confidence || 0);
    });
    
    for (const transform of transformations) {
      if (transform.pattern && transform.replacement && 
          (transform.confidence === undefined || transform.confidence > 0.5)) {
        
        // 创建正则表达式
        let pattern = transform.pattern;
        if (typeof pattern === 'string') {
          pattern = new RegExp(escapeRegExp(pattern), 'g');
        }
        
        const oldCode = transformedCode;
        transformedCode = transformedCode.replace(pattern, transform.replacement);
        
        // 检查是否产生变化
        if (oldCode !== transformedCode) {
          appliedTransformations.push(Object.assign({
            applied: true
          }, transform));
        }
      }
    }
    
    result.partiallyDecoded = transformedCode;
    result.decodedSegments = analysis.decodedSegments || [];
    
    // 如果有足够高置信度的解码，标记为成功
    if (appliedTransformations.length > 0) {
      for (const t of appliedTransformations) {
        if ((t.confidence || 0) > 0.8) {
          result.success = true;
          break;
        }
      }
      
      // 只有在高置信度的情况下才设置完全解码
      for (const t of appliedTransformations) {
        if ((t.confidence || 0) > 0.9) {
          result.decoded = transformedCode;
          break;
        }
      }
    }
  } catch (error) {
    result.error = error.message;
    result.stack = error.stack;
  }
  
  return result;
};

ExecutionAnalyzer.prototype._findEntryPoints = function(code, patterns, symbols) {
  const entryPoints = [];
  
  // 查找自执行函数
  const iifePatterns = [
    /\(function\s*\([^)]*\)\s*\{[\s\S]*?\}\s*\)\s*\([^)]*\)/g,
    /\(\s*function\s*\(\)\s*\{[\s\S]*?\}\s*\(\)\s*\)/g
  ];
  
  for (const pattern of iifePatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      entryPoints.push({
        name: '自执行函数',
        type: 'iife',
        position: match.index,
        code: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : '')
      });
    }
  }
  
  // 查找eval调用
  const evalPatterns = [
    /eval\s*\([^)]+\)/g,
    /Function\s*\([^)]*\)\s*\(\)/g
  ];
  
  for (const pattern of evalPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      entryPoints.push({
        name: '动态执行',
        type: 'eval-like',
        position: match.index,
        code: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : '')
      });
    }
  }
  
  // 查找JSFuck入口点
  if (code.includes('[]+[]') || code.includes('!+[]') || code.includes('!![]')) {
    // 查找可能的JSFuck执行点
    const jsFuckExecPattern = /\([^)]+\)\s*\[\s*(['"])_\1\s*\]\s*\(/g;
    let match;
    
    while ((match = jsFuckExecPattern.exec(code)) !== null) {
      entryPoints.push({
        name: 'JSFuck执行',
        type: 'jsfuck-exec',
        position: match.index,
        code: match[0].substring(0, 100) + (match[0].length > 100 ? '...' : '')
      });
    }
  }
  
  return entryPoints;
};

ExecutionAnalyzer.prototype._identifyKeyNodes = function(code, patterns, symbols) {
  const keyNodes = [];
  
  // 字符串拼接操作
  const stringConcatPattern = /(['"])(?:\\\1|.)*?\1\s*\+\s*(['"])(?:\\\2|.)*?\2/g;
  const stringConcats = code.match(stringConcatPattern);
  
  if (stringConcats && stringConcats.length > 3) {
    keyNodes.push({
      type: 'string-concatenation',
      count: stringConcats.length,
      description: '发现' + stringConcats.length + '处字符串拼接操作'
    });
  }
  
  // 字符操作
  const charOpPatterns = [
    /\.charAt\s*\(/g,
    /\.charCodeAt\s*\(/g,
    /String\.fromCharCode\s*\(/g,
    /\.substring\s*\(/g,
    /\.substr\s*\(/g
  ];
  
  let charOpsCount = 0;
  for (const pattern of charOpPatterns) {
    const matches = code.match(pattern);
    if (matches) {
      charOpsCount += matches.length;
    }
  }
  
  if (charOpsCount > 5) {
    keyNodes.push({
      type: 'character-operations',
      count: charOpsCount,
      description: '发现' + charOpsCount + '处字符操作函数调用'
    });
  }
  
  return keyNodes;
};

ExecutionAnalyzer.prototype._decodeStringConstructions = function(code, patterns) {
  const decodedSegments = [];
  
  // 应用基本的字符串构造模式解码
  const stringConstructionPatterns = patterns.stringConstruction || [];
  for (const pattern of stringConstructionPatterns) {
    if (pattern.regex && pattern.decodedValue && pattern.confidence > 0.7) {
      const regex = pattern.regex instanceof RegExp 
        ? pattern.regex 
        : new RegExp(pattern.regex, 'g');
      
      let match;
      while ((match = regex.exec(code)) !== null) {
        decodedSegments.push({
          type: 'string-construction',
          original: match[0],
          decoded: pattern.decodedValue,
          confidence: pattern.confidence,
          position: match.index
        });
      }
    }
  }
  
  // 解码十六进制转义
  const hexPattern = /\\x([0-9A-Fa-f]{2})/g;
  let hexMatch;
  
  while ((hexMatch = hexPattern.exec(code)) !== null) {
    try {
      const hex = hexMatch[1];
      const decodedChar = String.fromCharCode(parseInt(hex, 16));
      
      decodedSegments.push({
        type: 'hex-escape',
        original: hexMatch[0],
        decoded: decodedChar,
        confidence: 0.95,
        position: hexMatch.index
      });
    } catch (e) {
      // 解码失败，跳过
    }
  }
  
  // 解码Unicode转义
  const unicodePattern = /\\u([0-9A-Fa-f]{4})/g;
  let unicodeMatch;
  
  while ((unicodeMatch = unicodePattern.exec(code)) !== null) {
    try {
      const unicode = unicodeMatch[1];
      const decodedChar = String.fromCharCode(parseInt(unicode, 16));
      
      decodedSegments.push({
        type: 'unicode-escape',
        original: unicodeMatch[0],
        decoded: decodedChar,
        confidence: 0.95,
        position: unicodeMatch.index
      });
    } catch (e) {
      // 解码失败，跳过
    }
  }
  
  return decodedSegments;
};

ExecutionAnalyzer.prototype._decodeSpecialPatterns = function(code) {
  const decodedSegments = [];
  
  // JSFuck基本构造
  const jsFuckPatterns = [
    { pattern: /\[\]\[\+\[\]\]/g, value: 'undefined', confidence: 0.9 },
    { pattern: /\!\[\]/g, value: 'false', confidence: 0.9 },
    { pattern: /\!\!\[\]/g, value: 'true', confidence: 0.9 },
    { pattern: /\+\[\]/g, value: '0', confidence: 0.9 },
    { pattern: /\+\!\+\[\]/g, value: '1', confidence: 0.9 },
    { pattern: /\[\]\+\[\]/g, value: '""', confidence: 0.9 }
  ];
  
  for (const patternInfo of jsFuckPatterns) {
    let match;
    while ((match = patternInfo.pattern.exec(code)) !== null) {
      decodedSegments.push({
        type: 'jsfuck-basic',
        original: match[0],
        decoded: patternInfo.value,
        confidence: patternInfo.confidence
      });
    }
  }
  
  // 颜文字构造
  const emojiPatterns = [
    { pattern: /\(ﾟΘﾟ\)/g, value: '1', confidence: 0.8 },
    { pattern: /\(ﾟｰﾟ\)/g, value: '0', confidence: 0.8 },
    { pattern: /\(ﾟДﾟ\)\[ﾟoﾟ\]/g, value: '"', confidence: 0.8 },
    { pattern: /\(ﾟДﾟ\)\[ﾟεﾟ\]/g, value: '\\', confidence: 0.8 }
  ];
  
  for (const patternInfo of emojiPatterns) {
    let match;
    while ((match = patternInfo.pattern.exec(code)) !== null) {
      decodedSegments.push({
        type: 'emoji-construct',
        original: match[0],
        decoded: patternInfo.value,
        confidence: patternInfo.confidence
      });
    }
  }
  
  return decodedSegments;
};

ExecutionAnalyzer.prototype._safeExecuteDecode = function(code, patterns) {
  if (!this.options.safeExecution) {
    return [];
  }
  
  const decodedSegments = [];
  
  try {
    // 找到可能的JSFuck片段
    const encodedChunks = patterns.encodedChunks || [];
    const jsFuckChunks = encodedChunks.filter(function(chunk) {
      return chunk.type === 'high-entropy-block' && 
             /^[\+\!\(\)\[\]]+$/.test(chunk.chunk.trim());
    });
    
    for (const chunk of jsFuckChunks) {
      if (chunk.chunk && chunk.chunk.length > 20 && chunk.chunk.length < 5000) {
        try {
          // 安全执行
          const self = this;
          executeSandboxed(chunk.chunk, this.options.maxExecutionTime)
            .then(function(result) {
              if (result && result !== chunk.chunk) {
                decodedSegments.push({
                  type: 'executed-decode',
                  original: chunk.chunk.substring(0, 100) + (chunk.chunk.length > 100 ? '...' : ''),
                  decoded: String(result),
                  confidence: 0.7,
                  sandboxed: true
                });
              }
            })
            .catch(function(error) {
              // 执行失败，忽略
            });
        } catch (e) {
          // 执行失败，忽略
        }
      }
    }
  } catch (error) {
    decodedSegments.push({
      type: 'execution-error',
      message: error.message,
      stack: error.stack
    });
  }
  
  return decodedSegments;
};

ExecutionAnalyzer.prototype._generateCacheKey = function(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash) + code.charCodeAt(i);
    hash |= 0;
  }
  return 'segments_' + hash;
};

// 报告生成器
function ReportGenerator() {
  this.reportCache = new Map();
}

ReportGenerator.prototype.generateReport = function(analysisState) {
  // 创建基本报告结构
  const report = {
    summary: {
      obfuscationType: analysisState.obfuscationType || '未知混淆',
      obfuscationLevel: this._calculateObfuscationLevel(analysisState),
      decodingConfidence: this._calculateDecodingConfidence(analysisState),
      mainTechniques: this._identifyMainTechniques(analysisState)
    },
    obfuscationType: analysisState.obfuscationType,
    statistics: {
      originalLength: analysisState.originalLength || 0,
      decodedSegmentsCount: (analysisState.decodedSegments || []).length,
      transformationsCount: (analysisState.transformations || []).length
    },
    decodedSegments: analysisState.decodedSegments || [],
    transformations: analysisState.transformations || [],
    error: analysisState.error || null,
    analysisTime: analysisState.analysisTime || 0
  };
  
  return report;
};

ReportGenerator.prototype.formatReport = function(report) {
  let text = '# 混淆代码分析报告\n\n';
  
  // 添加摘要
  text += '## 摘要\n\n';
  text += '- **检测类型**: ' + report.obfuscationType + '\n';
  text += '- **代码长度**: ' + report.statistics.originalLength + ' 字符\n';
  text += '- **混淆强度**: ' + report.summary.obfuscationLevel + '\n';
  text += '- **解码信心**: ' + report.summary.decodingConfidence + '\n';
  text += '- **分析用时**: ' + report.analysisTime + ' ms\n\n';
  
  // 添加解混淆信息
  text += '## 解混淆\n\n';
  text += '- **可应用转换**: ' + report.transformations.length + ' 项\n';
  text += '- **已解码片段**: ' + report.decodedSegments.length + ' 个\n\n';
  
  return text;
};

ReportGenerator.prototype._calculateObfuscationLevel = function(analysisState) {
  // 基于混淆类型判断
  if (analysisState.obfuscationType === 'jsfuck-variant') {
    return '高 - JSFuck变种';
  } else if (analysisState.obfuscationType === 'emoji-jsfuck') {
    return '极高 - 颜文字JSFuck混合';
  } else if (analysisState.obfuscationType === 'mixed-obfuscation') {
    return '中等 - 混合混淆';
  }
  
  return '低 - 基本混淆';
};

ReportGenerator.prototype._calculateDecodingConfidence = function(analysisState) {
  const decodedSegments = analysisState.decodedSegments || [];
  
  if (decodedSegments.length === 0) {
    return '无 - 未能解码';
  }
  
  return '中 - 部分解码可能准确';
};

ReportGenerator.prototype._identifyMainTechniques = function(analysisState) {
  const techniques = [];
  
  // 基于混淆类型
  if (analysisState.obfuscationType === 'jsfuck-variant') {
    techniques.push('JSFuck变种编码');
  } else if (analysisState.obfuscationType === 'emoji-jsfuck') {
    techniques.push('颜文字JSFuck混合编码');
  }
  
  return techniques.length > 0 ? techniques : ['基本变量重命名', '基本字符串混淆'];
};

// 混淆引擎
function ObfuscationEngine(options) {
  this.options = {
    maxAnalysisTime: 5000,
    maxRecursionDepth: 10,
    safeExecution: false
  };
  
  // 合并传入的选项
  if (options) {
    for (const key in options) {
      if (options.hasOwnProperty(key)) {
        this.options[key] = options[key];
      }
    }
  }
  
  this.patternRecognizer = new PatternRecognizer();
  this.symbolsTracker = new SymbolsTracker();
  this.executionAnalyzer = new ExecutionAnalyzer(this.options);
  this.decodingCache = new Map();
}

ObfuscationEngine.prototype.analyze = function(code) {
  const startTime = Date.now();
  
  const analysisState = {
    code: code,
    originalLength: code.length,
    obfuscationType: null,
    patterns: {},
    symbols: {},
    executionPath: [],
    decodedSegments: [],
    transformations: []
  };
  
  try {
    // 识别混淆类型
    analysisState.obfuscationType = this.patternRecognizer.identifyType(code);
    
    // 提取符号和模式
    if (Date.now() - startTime < this.options.maxAnalysisTime) {
      analysisState.symbols = this.symbolsTracker.extractSymbols(code);
      analysisState.patterns = this.patternRecognizer.extractPatterns(code, analysisState.symbols);
    }
    
    // 分析执行路径
    if (Date.now() - startTime < this.options.maxAnalysisTime) {
      analysisState.executionPath = this.executionAnalyzer.analyzeFlow(
        code, analysisState.patterns, analysisState.symbols
      );
    }
    
    // 尝试解码片段
    if (Date.now() - startTime < this.options.maxAnalysisTime) {
      analysisState.decodedSegments = this.executionAnalyzer.decodeSegments(
        code, analysisState.patterns, analysisState.executionPath
      );
    }
    
    // 生成转换和映射
    if (Date.now() - startTime < this.options.maxAnalysisTime) {
      analysisState.transformations = this.patternRecognizer.generateTransformations(
        analysisState.patterns, analysisState.symbols, analysisState.decodedSegments
      );
    }
  } catch (error) {
    analysisState.error = error.message;
    analysisState.errorStack = error.stack;
  } finally {
    analysisState.analysisTime = Date.now() - startTime;
  }
  
  return analysisState;
};

ObfuscationEngine.prototype.decode = function(code) {
  // 检查缓存
  const cacheKey = this._generateCacheKey(code);
  if (this.decodingCache.has(cacheKey)) {
    return this.decodingCache.get(cacheKey);
  }
  
  // 先分析代码
  const analysis = this.analyze(code);
  
  // 基于分析结果执行解码
  const result = this.executionAnalyzer.attemptDecode(code, analysis);
  
  // 缓存结果
  this.decodingCache.set(cacheKey, result);
  
  return result;
};

ObfuscationEngine.prototype._generateCacheKey = function(code) {
  let hash = 0;
  for (let i = 0; i < code.length; i++) {
    hash = ((hash << 5) - hash) + code.charCodeAt(i);
    hash |= 0;
  }
  return 'decode_' + hash;
};

// 主解码函数
function decodeJSFuck(code, options) {
  options = options || {};
  
  // 创建引擎实例
  const engine = new ObfuscationEngine(options);
  
  try {
    // 分析混淆代码
    const analysis = engine.analyze(code);
    
    // 尝试解码
    const decodingResult = engine.decode(code);
    
    // 生成报告
    const reportGenerator = new ReportGenerator();
    const report = reportGenerator.generateReport(analysis);
    
    // 如果需要文本报告
    if (options.textReport) {
      decodingResult.textReport = reportGenerator.formatReport(report);
    }
    
    // 合并结果
    return Object.assign({}, decodingResult, {
      analysis: report,
      success: decodingResult.success || false
    });
  } catch (error) {
    return {
      original: code,
      decoded: null,
      error: error.message,
      stack: error.stack,
      success: false
    };
  }
}

// 批量处理函数
function batchDecode(code, options) {
  options = options || {};
  const results = [];
  const engine = new ObfuscationEngine(options);
  
  try {
    const analysis = engine.analyze(code);
    const obfuscationType = analysis.obfuscationType;
    
    if (obfuscationType === 'jsfuck-variant' || obfuscationType === 'emoji-jsfuck') {
      results.push(decodeJSFuck(code, options));
    } else if (obfuscationType === 'mixed-obfuscation') {
      const jsFuckResult = decodeJSFuck(code, options);
      results.push(jsFuckResult);
    } else {
      results.push(decodeJSFuck(code, options));
    }
    
    // 返回最佳结果
    return results.sort(function(a, b) {
      if (a.success && !b.success) return -1;
      if (!a.success && b.success) return 1;
      if (a.decoded && b.decoded) return b.decoded.length - a.decoded.length;
      if (a.partiallyDecoded && b.partiallyDecoded) return b.partiallyDecoded.length - a.partiallyDecoded.length;
      return 0;
    })[0];
  } catch (error) {
    return {
      original: code,
      decoded: null,
      error: error.message,
      stack: error.stack,
      success: false
    };
  }
}

// 导出函数和类
module.exports = {
  decodeJSFuck: decodeJSFuck,
  batchDecode: batchDecode,
  ObfuscationEngine: ObfuscationEngine,
  PatternRecognizer: PatternRecognizer,
  SymbolsTracker: SymbolsTracker,
  ExecutionAnalyzer: ExecutionAnalyzer,
  ReportGenerator: ReportGenerator
};

// 设置默认导出
module.exports.default = decodeJSFuck;
