/**
 * JSFuck解码器 - 通用JavaScript混淆解析引擎
 * 一个自适应的JSFuck及其变种解码器
 */

// 1-主解码函数
function decodeJSFuck(code, options = {}) {
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
    return {
      ...decodingResult,
      analysis: report,
      success: decodingResult.success || false
    };
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
function batchDecode(code, options = {}) {
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
    return results.sort((a, b) => {
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
/**
 * 2-辅助函数
 */
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
/**
 * 3-沙箱执行环境
 */
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

function executeSandboxed(code, timeout = 3000) {
  if (!isSafeToExecute(code)) {
    throw new Error('代码不安全，拒绝执行');
  }
  
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('执行超时'));
    }, timeout);
    
    try {
      const result = Function(`
        "use strict";
        const alert = function() {};
        const confirm = function() {};
        const prompt = function() {};
        const eval = function() { throw new Error('不允许使用eval'); };
        
        try {
          return ${code};
        } catch (e) {
          return { error: e.message };
        }
      `)();
      
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}
/**
 * 4-混淆引擎
 */
class ObfuscationEngine {
  constructor(options = {}) {
    this.options = {
      maxAnalysisTime: 5000,
      maxRecursionDepth: 10,
      safeExecution: false,
      ...options
    };
    
    this.patternRecognizer = new PatternRecognizer();
    this.symbolsTracker = new SymbolsTracker();
    this.executionAnalyzer = new ExecutionAnalyzer(this.options);
    this.decodingCache = new Map();
  }
  
  analyze(code) {
    const startTime = Date.now();
    
    const analysisState = {
      code,
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
  }
  
  decode(code) {
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
  }
  
  _generateCacheKey(code) {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = ((hash << 5) - hash) + code.charCodeAt(i);
      hash |= 0;
    }
    return 'decode_' + hash;
  }
}
/**
 * 5-符号跟踪器
 */
class SymbolsTracker {
  constructor() {
    this.symbolsCache = new Map();
  }
  
  extractSymbols(code) {
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
  }
  
  _extractVariables(code, symbols) {
    // var声明
    const varDeclarations = [...code.matchAll(/var\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g)];
    for (const [_, name, value] of varDeclarations) {
      symbols.variables[name] = {
        type: 'var',
        initialValue: value.trim(),
        usageCount: 0
      };
    }
    
    // let声明
    const letDeclarations = [...code.matchAll(/let\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g)];
    for (const [_, name, value] of letDeclarations) {
      symbols.variables[name] = {
        type: 'let',
        initialValue: value.trim(),
        usageCount: 0
      };
    }
    // const声明
    const constDeclarations = [...code.matchAll(/const\s+([a-zA-Z0-9_$]+)\s*=\s*([^;]+);/g)];
    for (const [_, name, value] of constDeclarations) {
      symbols.variables[name] = {
        type: 'const',
        initialValue: value.trim(),
        usageCount: 0
      };
    }
    
    // 查找颜文字变量
    this._findEmojiVariables(code, symbols);
    
    // 统计变量使用频率
    for (const varName of Object.keys(symbols.variables)) {
      const escapedName = escapeRegExp(varName);
      const regex = new RegExp(`\\b${escapedName}\\b`, 'g');
      symbols.variables[varName].usageCount = (code.match(regex) || []).length;
    }
  }
  
  _findEmojiVariables(code, symbols) {
    // 颜文字模式
    const emojiPatterns = [
      /(\(ﾟДﾟ\))\s*=\s*([^;]+);/g,
      /(\(o\^_\^o\))\s*=\s*([^;]+);/g,
      /(ﾟωﾟ\S*)\s*=\s*([^;]+);/g,
      /(ﾟΘﾟ\S*)\s*=\s*([^;]+);/g,
      /(\('_'\))\s*=\s*([^;]+);/g
    ];
    
    for (const pattern of emojiPatterns) {
      const matches = [...code.matchAll(pattern)];
      for (const [_, name, value] of matches) {
        symbols.variables[name] = {
          type: 'emoji-var',
          initialValue: value.trim(),
          usageCount: 0
        };
      }
    }
    
    // 尝试动态识别其他颜文字变量
    const potentialEmojiVars = [...code.matchAll(/(\([^a-zA-Z0-9_$\s)(]+\))\s*=\s*([^;]+);/g)];
    for (const [_, name, value] of potentialEmojiVars) {
      if (!symbols.variables[name]) {
        symbols.variables[name] = {
          type: 'potential-emoji-var',
          initialValue: value.trim(),
          usageCount: 0
        };
      }
    }
    
    // 统计使用频率
    for (const varName of Object.keys(symbols.variables).filter(name => 
      symbols.variables[name].type === 'emoji-var' || 
      symbols.variables[name].type === 'potential-emoji-var')) {
      
      const escapedName = escapeRegExp(varName);
      const regex = new RegExp(escapedName, 'g');
      symbols.variables[varName].usageCount = (code.match(regex) || []).length;
    }
  }
  /**
 * 6-模式识别器
 */
class PatternRecognizer {
  constructor() {
    this.patternRegistry = new Map();
    this.signatureCache = new Map();
  }
  
  identifyType(code) {
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
  }
  
  extractPatterns(code, symbols) {
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
  }
  
  _findStringConstructionPatterns(code, patterns) {
    // JSFuck风格的数字构造
    const digitPatterns = [
      { regex: /\+\[\]/g, value: '0', confidence: 0.95 },
      { regex: /\+\!\+\[\]/g, value: '1', confidence: 0.95 },
      { regex: /(!+\[\]){2,}/g, value: '', confidence: 0.7 }
    ];
    
    for (const dp of digitPatterns) {
      if (dp.regex) {
        const matches = [...code.matchAll(dp.regex)];
        if (matches.length > 0) {
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
  }
  /**
 * 7-执行分析器
 */
class ExecutionAnalyzer {
  constructor(options = {}) {
    this.options = {
      maxRecursionDepth: 10,
      safeExecution: false,
      maxExecutionTime: 3000,
      ...options
    };
    
    this.executionState = null;
    this.decodingCache = new Map();
  }
  
  analyzeFlow(code, patterns, symbols) {
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
      executionFlow.push(...entryPoints.map(entry => ({
        type: 'entry-point',
        ...entry
      })));
      
      // 识别关键执行节点
      const keyNodes = this._identifyKeyNodes(code, patterns, symbols);
      executionFlow.push(...keyNodes.map(node => ({
        type: 'key-node',
        ...node
      })));
    } catch (error) {
      executionFlow.push({
        type: 'error',
        message: error.message,
        stack: error.stack
      });
    }
    
    return executionFlow;
  }
  
  decodeSegments(code, patterns, executionFlow) {
    const decodedSegments = [];
    
    try {
      // 检查缓存
      const cacheKey = this._generateCacheKey(code);
      if (this.decodingCache.has(cacheKey)) {
        return this.decodingCache.get(cacheKey);
      }
      
      // 解码字符串构造
      const decodedStrings = this._decodeStringConstructions(code, patterns);
      decodedSegments.push(...decodedStrings);
      
      // 解码特殊模式
      const specialDecodings = this._decodeSpecialPatterns(code);
      decodedSegments.push(...specialDecodings);
      
      // 尝试安全执行解码
      if (this.options.safeExecution) {
        const executionResults = this._safeExecuteDecode(code, patterns);
        if (executionResults.length > 0) {
          decodedSegments.push(...executionResults);
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
  }
  /**
 * 8-报告生成器
 */
class ReportGenerator {
  constructor() {
    this.reportCache = new Map();
  }
  
  generateReport(analysisState) {
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
  }
  
  formatReport(report) {
    let text = `# 混淆代码分析报告\n\n`;
    
    // 添加摘要
    text += `## 摘要\n\n`;
    text += `- **检测类型**: ${report.obfuscationType}\n`;
    text += `- **代码长度**: ${report.statistics.originalLength} 字符\n`;
    text += `- **混淆强度**: ${report.summary.obfuscationLevel}\n`;
    text += `- **解码信心**: ${report.summary.decodingConfidence}\n`;
    text += `- **分析用时**: ${report.analysisTime} ms\n\n`;
    
    // 添加解混淆信息
    text += `## 解混淆\n\n`;
    text += `- **可应用转换**: ${report.transformations.length} 项\n`;
    text += `- **已解码片段**: ${report.decodedSegments.length} 个\n\n`;
    
    return text;
  }
  
  _calculateObfuscationLevel(analysisState) {
    // 基于混淆类型判断
    if (analysisState.obfuscationType === 'jsfuck-variant') {
      return '高 - JSFuck变种';
    } else if (analysisState.obfuscationType === 'emoji-jsfuck') {
      return '极高 - 颜文字JSFuck混合';
    } else if (analysisState.obfuscationType === 'mixed-obfuscation') {
      return '中等 - 混合混淆';
    }
    
    return '低 - 基本混淆';
  }
  
  _calculateDecodingConfidence(analysisState) {
    const decodedSegments = analysisState.decodedSegments || [];
    
    if (decodedSegments.length === 0) {
      return '无 - 未能解码';
    }
    
    return '中 - 部分解码可能准确';
  }
  
  _identifyMainTechniques(analysisState) {
    const techniques = [];
    
    // 基于混淆类型
    if (analysisState.obfuscationType === 'jsfuck-variant') {
      techniques.push('JSFuck变种编码');
    } else if (analysisState.obfuscationType === 'emoji-jsfuck') {
      techniques.push('颜文字JSFuck混合编码');
    }
    
    return techniques.length > 0 ? techniques : ['基本变量重命名', '基本字符串混淆'];
  }
}

// 导出函数和类
module.exports = {
  decodeJSFuck,
  batchDecode,
  ObfuscationEngine,
  PatternRecognizer,
  SymbolsTracker,
  ExecutionAnalyzer,
  ReportGenerator
};

// 设置默认导出
module.exports.default = decodeJSFuck;
