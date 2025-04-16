/**
 * JSJiami v7 解密工具包装器 - 将JSJiami v7解密工具转换为浏览器可用版本
 */
// 创建自执行函数来隔离作用域
(function() {
  // 模拟Node.js环境
  const module = { exports: {} };
  const exports = module.exports;
  
  // 以下粘贴原始jsjiami-v7-decoder.js插件代码
  // ====== 开始: 原始jsjiami-v7-decoder.js代码 ======
  
  /**
   * 解密由JSJiami v7加密的JavaScript代码
   * @param {string} code - 要解密的代码
   * @returns {string|null} - 解密后的代码或null（解密失败时）
   */
  function plugin(code) {
    try {
      // 检测是否是JSJiami v7加密
      if (!code.includes('function(') || !code.includes('const') || !code.includes('var') || !code.includes('|')) {
        return null;
      }
      
      // JSJiami v7特征检测 - 特征性的代码格式
      const jiamiFeatures = [
        /\(function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\s*\{/,
        /var\s+_0x[a-f0-9]+=\s*\(function\(\)\s*\{/,
        /const\s+_0x[a-f0-9]+=function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\s*\{/,
        /return\s+\(function\(_0x[a-f0-9]+\)\s*\{/
      ];
      
      // 至少需要匹配两个特征才认为是JSJiami v7
      let featureMatches = 0;
      for (const pattern of jiamiFeatures) {
        if (pattern.test(code)) {
          featureMatches++;
        }
      }
      
      if (featureMatches < 2) {
        return null;
      }
      
      // 提取核心加密数组
      const hexArraysMatches = code.match(/var\s+(_0x[a-f0-9]+)\s*=\s*\[\s*([^\]]+)\s*\]\s*;/g);
      if (!hexArraysMatches) {
        return null;
      }
      
      // 解析所有的十六进制数组
      let hexArrays = {};
      for (const arrayMatch of hexArraysMatches) {
        const nameMatch = arrayMatch.match(/var\s+(_0x[a-f0-9]+)\s*=/);
        if (!nameMatch) continue;
        
        const arrayName = nameMatch[1];
        const contentMatch = arrayMatch.match(/=\s*\[\s*([^\]]+)\s*\]/);
        if (!contentMatch) continue;
        
        try {
          // 解析数组内容
          const arrayStr = `[${contentMatch[1]}]`;
          // 安全地执行数组解析
          const sanitizedStr = arrayStr.replace(/\\x([a-f0-9]{2})/g, (m, p) => {
            return String.fromCharCode(parseInt(p, 16));
          });
          hexArrays[arrayName] = Function(`"use strict"; return ${sanitizedStr}`)();
        } catch (e) {
          console.warn("解析数组失败:", e);
        }
      }
      
      // 查找数组重排函数
      const shuffleFunctions = code.match(/function\s+(_0x[a-f0-9]+)\s*\(\s*\)\s*\{\s*(_0x[a-f0-9]+)\s*\.\s*push\s*\(\s*\2\s*\.\s*shift\s*\(\s*\)\s*\)\s*;/g);
      
      if (shuffleFunctions) {
        for (const funcStr of shuffleFunctions) {
          const arrayNameMatch = funcStr.match(/\{\s*(_0x[a-f0-9]+)\s*\.\s*push/);
          if (!arrayNameMatch) continue;
          
          const arrayName = arrayNameMatch[1];
          if (hexArrays[arrayName]) {
            // 执行数组重排
            const array = hexArrays[arrayName];
            // 模拟完整的重排操作
            const length = array.length;
            for (let i = 0; i < length; i++) {
              array.push(array.shift());
            }
          }
        }
      }
      
      // 创建解密函数映射
      let decodedCode = code;
      
      // 替换数组引用
      for (const arrayName in hexArrays) {
        const array = hexArrays[arrayName];
        // 替换形如 _0x123456[12] 的引用
        const pattern = new RegExp(`${arrayName}\\[(\\d+)\\]`, 'g');
        decodedCode = decodedCode.replace(pattern, (match, index) => {
          const idx = parseInt(index, 10);
          if (idx >= 0 && idx < array.length) {
            // 转义字符串值
            return JSON.stringify(array[idx]);
          }
          return match;
        });
      }
      
      // 处理动态解密函数
      const decryptFunctions = decodedCode.match(/function\s+(_0x[a-f0-9]+)\s*\(\s*_0x[a-f0-9]+\s*,\s*_0x[a-f0-9]+\s*\)\s*\{\s*.*?return\s+.*?\}/gs);
      
      if (decryptFunctions) {
        for (const funcStr of decryptFunctions) {
          const funcNameMatch = funcStr.match(/function\s+(_0x[a-f0-9]+)/);
          if (!funcNameMatch) continue;
          
          const funcName = funcNameMatch[1];
          // 查找该函数的所有调用
          const funcCallPattern = new RegExp(`${funcName}\\((['"])([^'"]+)\\1\\s*,\\s*(['"])([^'"]+)\\3\\)`, 'g');
          
          decodedCode = decodedCode.replace(funcCallPattern, (match, q1, str, q2, key) => {
            try {
              // 简化版的解密实现，根据JSJiami v7常用的解密算法
              let result = '';
              for (let i = 0; i < str.length; i++) {
                const charCode = str.charCodeAt(i) ^ key.charCodeAt(i % key.length);
                result += String.fromCharCode(charCode);
              }
              return JSON.stringify(result);
            } catch (e) {
              return match;
            }
          });
        }
      }
      
      // 清理多余的代码
      // 1. 移除数组声明
      decodedCode = decodedCode.replace(/var\s+_0x[a-f0-9]+\s*=\s*\[\s*([^\]]+)\s*\]\s*;/g, '');
      // 2. 移除数组重排函数
      decodedCode = decodedCode.replace(/function\s+_0x[a-f0-9]+\s*\(\s*\)\s*\{\s*_0x[a-f0-9]+\s*\.\s*push\s*\(\s*_0x[a-f0-9]+\s*\.\s*shift\s*\(\s*\)\s*\)\s*;\s*\}/g, '');
      // 3. 移除解密函数
      decodedCode = decodedCode.replace(/function\s+_0x[a-f0-9]+\s*\(\s*_0x[a-f0-9]+\s*,\s*_0x[a-f0-9]+\s*\)\s*\{\s*.*?return\s+.*?\}/gs, '');
      // 4. 移除主要加密包装函数
      decodedCode = decodedCode.replace(/\(function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\s*\{[\s\S]*?}(?:\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\))?\);/, '');
      
      // 清理注释和多余空行
      decodedCode = decodedCode.replace(/\/\/.*?(?:\r\n|\n|$)/g, '\n');
      decodedCode = decodedCode.replace(/\/\*[\s\S]*?\*\//g, '');
      decodedCode = decodedCode.replace(/\n\s*\n+/g, '\n\n');
      
      // 处理可能的字符串拼接
      decodedCode = decodedCode.replace(/'[ \t]*\+[ \t]*'/g, '');
      
      return decodedCode;
    } catch (error) {
      console.error("JSJiami v7 解密发生错误:", error);
      return null;
    }
  }
  
  // 导出插件接口
  exports.plugin = function(code) {
    return plugin(code);
  };
  
  // ====== 结束: 原始jsjiami-v7-decoder.js代码 ======
  
  // 将插件注册到全局解密插件库
  window.DecodePlugins = window.DecodePlugins || {};
  window.DecodePlugins.jsjiami_v7 = {
    detect: function(code) {
      // 检测是否是JSJiami v7加密的代码
      const v7Features = [
        /\(function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\s*\{/,
        /var\s+_0x[a-f0-9]+=\s*\(function\(\)\s*\{/,
        /const\s+_0x[a-f0-9]+=function\(_0x[a-f0-9]+,\s*_0x[a-f0-9]+\)\s*\{/
      ];
      
      let featureCount = 0;
      for (const pattern of v7Features) {
        if (pattern.test(code)) {
          featureCount++;
        }
      }
      
      return featureCount >= 2;
    },
    plugin: function(code) {
      // 使用原始模块的功能
      return module.exports.plugin(code);
    }
  };
  
  console.log("JSJiami v7 解密插件已加载");
})();
