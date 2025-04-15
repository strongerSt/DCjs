/**
 * AADecode - 解码日式表情符号加密的JavaScript代码
 * 基于jamtg的aadecode实现，针对解码器项目进行了优化
 */

// 主解码函数
function aadecode(text) {
  var evalPreamble = "var _ = String.fromCharCode; var __ = 'AAAAA'; ";
  var decodePreamble = "( ﾟДﾟ) ['_'] ( ﾟДﾟ) ['_'] (ﾟΘﾟ) ";
  var decodeChars = {
    "(c^_^o)": "0",
    "(ﾟΘﾟ)": "1",
    "((o^_^o) - (ﾟΘﾟ))": "1",
    "(o^_^o)": "2",
    "((ﾟｰﾟ) + (ﾟΘﾟ))": "3",
    "((o^_^o) + (o^_^o))": "4",
    "((ﾟｰﾟ) + (o^_^o))": "5",
    "((ﾟｰﾟ) + (ﾟｰﾟ))": "6",
    "((ﾟｰﾟ) + (ﾟｰﾟ) + (ﾟΘﾟ))": "7",
    "((ﾟｰﾟ) + (ﾟｰﾟ) + (o^_^o))": "8",
    "((ﾟｰﾟ) + (ﾟｰﾟ) + (ﾟｰﾟ))": "9"
  };

  try {
    // 如果不是AAEncode格式，直接返回原文本
    if (!isAAEncoded(text)) {
      return null;
    }

    // 移除空格和注释
    text = text.replace(/\/\*.*?\*\//g, "").trim();

    // 检查是否有典型的AAEncode头部
    if (!/ﾟωﾟﾉ/.test(text) && !/(ﾟДﾟ)\s*\[\s*'\s*_\s*'\s*\]/.test(text)) {
      return tryAlternativeDecoding(text);
    }

    // 从AAEncode格式中提取有效内容
    const extractCodeBody = () => {
      // 寻找自执行函数
      const execMatch = text.match(/\(([^]*)\)\(\);?$/);
      if (execMatch) {
        return execMatch[1];
      }

      // 寻找代码体
      const bodyMatch = text.match(/ﾟωﾟﾉ\s*=\s*\/(.+?)\/(.+?)(?:\(|$)/);
      if (bodyMatch) {
        return bodyMatch[2];
      }

      // 如果上述方法都失败，尝试提取括号中的内容
      const parenMatch = text.match(/\(([^()]+(?:\([^()]*\)[^()]*)*)\)/);
      if (parenMatch) {
        return parenMatch[1];
      }

      return text;
    };

    // 提取代码体
    const codeBody = extractCodeBody();

    // 准备执行环境
    const sandbox = `
      // AAEncode 执行环境
      var ﾟωﾟ, _ﾟωﾟ, __ﾟωﾟ, ___ﾟωﾟ, ____ﾟωﾟ;
      var ﾟΘﾟ, _ﾟΘﾟ, __ﾟΘﾟ, ___ﾟΘﾟ, ____ﾟΘﾟ;
      var ﾟｰﾟ, _ﾟｰﾟ, __ﾟｰﾟ, ___ﾟｰﾟ, ____ﾟｰﾟ;
      var ﾟДﾟ, _ﾟДﾟ, __ﾟДﾟ, ___ﾟДﾟ, ____ﾟДﾟ;
      var o, c, _, oo, cc;
      var ﾟεﾟ, oﾟｰﾟo, ﾟωﾟﾉ = {};
      var ﾟㅣﾟ = '';
      
      // 捕获输出
      var result = '';
      var originalAlert = alert;
      var originalDocument = document;
      
      // 重定向输出函数
      window = {
        document: {
          write: function(str) {
            result += str;
          },
          writeln: function(str) {
            result += str + '\\n';
          }
        }
      };
      
      document = window.document;
      
      // 重定向console.log和alert
      console.log = function(str) {
        result += str;
      };
      
      alert = function(str) {
        result += str;
      };
      
      // 尝试执行AAEncode代码
      try {
        ${codeBody}
        
        // 捕获常见的输出变量
        if (typeof c !== 'undefined') {
          result = c + result;
        }
        
        if (typeof oﾟｰﾟo !== 'undefined' && typeof oﾟｰﾟo === 'string') {
          result = oﾟｰﾟo + result;
        }
        
        if (typeof ﾟㅣﾟ !== 'undefined' && typeof ﾟㅣﾟ === 'string') {
          result = ﾟㅣﾟ + result;
        }
      } catch (e) {
        console.error("AADecode执行错误:", e);
        result = "ERROR: " + e.message;
      }
      
      // 还原环境
      alert = originalAlert;
      document = originalDocument;
      
      return result;
    `;

    try {
      // 执行解码
      const sandboxFn = new Function(sandbox);
      const decodedResult = sandboxFn();
      
      if (decodedResult && decodedResult !== "ERROR: " && decodedResult.length > 0) {
        return decodedResult;
      }
    } catch (e) {
      console.error("AADecode沙箱执行错误:", e);
    }

    // 如果主要方法失败，尝试替代方法
    return tryAlternativeDecoding(text);
  } catch (e) {
    console.error("AADecode总体错误:", e);
    return null;
  }
}

// 检查是否是AAEncode加密的代码
function isAAEncoded(text) {
  if (typeof text !== 'string') {
    return false;
  }
  
  // AAEncode的特征模式
  const patterns = [
    'ﾟωﾟ',
    'ﾟДﾟ',
    'ﾟΘﾟ',
    'ﾟｰﾟ',
    '(c^_^o)',
    '(o^_^o)',
    '(ﾟДﾟ)[',
    'ヽ(',
    'c="',
    '(╯°□°）