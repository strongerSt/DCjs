/**
 * AAencode (颜文字JavaScript) 解密插件 - 简化版
 * 不使用异步操作，保持与现有系统兼容
 */

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }
    
    try {
        // 创建一个安全的简化版本
        let simplifiedCode = code
            .replace(/ﾟωﾟﾉ/g, 'var1')
            .replace(/ﾟｰﾟ/g, 'var2')
            .replace(/ﾟΘﾟ/g, 'var3')
            .replace(/ﾟДﾟ/g, 'var4')
            .replace(/\(o\^_\^o\)/g, 'var5')
            .replace(/ﾟoﾟ/g, 'result');
            
        // 尝试提取字符串字面量
        const stringLiterals = [];
        code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
            if (content.length > 5) stringLiterals.push(content);
            return match;
        });
        
        // 如果找到了字符串，添加到结果中
        if (stringLiterals.length > 0) {
            // 按长度排序并取最长的几个
            const sortedStrings = [...stringLiterals].sort((a, b) => b.length - a.length);
            let result = "// AAencode可能的字符串：\n";
            
            // 添加前5个最长的字符串
            for (let i = 0; i < Math.min(5, sortedStrings.length); i++) {
                result += `// ${i+1}. ${sortedStrings[i]}\n`;
            }
            
            // 添加简化后的代码
            result += "\n// 简化后的代码：\n" + simplifiedCode;
            return result;
        }
        
        // 没有找到有意义的字符串，返回简化的代码
        return "// AAencode简化代码：\n" + simplifiedCode;
        
    } catch (e) {
        // 发生错误，返回错误信息和原始代码
        return `// AAencode解码错误: ${e.message}\n${code}`;
    }
}

// 导出函数
module.exports = decodeAAencode;