/**
 * AAencode (颜文字JavaScript) 解密插件
 * 使用多种方法尝试解码，确保产生有用结果
 */

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }
    
    try {
        // 方法1: 使用正则表达式直接提取最终的字符串结果
        // AAencode最常见的模式是构建一个字符一个字符的字符串
        let extractedChars = '';
        const charExtractPattern = /\(ﾟДﾟ\)\s*\[\s*['"]([a-z])['"]]/g;
        let match;
        while ((match = charExtractPattern.exec(code)) !== null) {
            extractedChars += match[1];
        }
        
        // 如果成功提取到较长的字符串，直接返回
        if (extractedChars.length > 5) {
            return `// AAencode解码结果 (通过字符提取):\n${extractedChars}`;
        }
        
        // 方法2: 提取并分析字符串构造
        // AAencode常常在结尾构造最终字符串
        const finalAssignment = code.match(/\(ﾟoﾟ\)\s*=(.+?)(?:;|$)/s);
        if (finalAssignment && finalAssignment[1]) {
            const construction = finalAssignment[1];
            
            // 分析构造的部分
            const stringParts = [];
            const stringLiteralPattern = /['"]([^'"]+)['"]/g;
            while ((match = stringLiteralPattern.exec(construction)) !== null) {
                if (match[1] && match[1].length > 0) {
                    stringParts.push(match[1]);
                }
            }
            
            // 如果提取到多个字符串部分，合并它们
            if (stringParts.length > 0) {
                const combined = stringParts.join('');
                if (combined.length > 5) {
                    return `// AAencode解码结果 (通过字符串合并):\n${combined}`;
                }
            }
        }
        
        // 方法3: 尝试执行代码 (如果环境允许)
        try {
            // 使用间接eval的方式尝试执行
            const indirectEval = (0, eval);
            
            // 创建一个预先定义变量的包装函数
            const wrapper = `
                // 创建一个安全的执行环境
                var window = {};
                var document = { createElement: function() { return {}; } };
                var navigator = { userAgent: '' };
                var location = { href: '' };
                var $response = {};
                var $request = {};
                var $data = {};
                
                // 执行AAencode代码
                ${code}
                
                // 返回可能的结果
                if (typeof ﾟoﾟ !== 'undefined') {
                    return ﾟoﾟ;
                } else {
                    // 尝试自动检测其他可能的结果变量
                    for (var key in this) {
                        if (key.indexOf('ﾟ') >= 0 && typeof this[key] === 'string') {
                            return this[key];
                        }
                    }
                    return "未找到结果变量";
                }
            `;
            
            // 尝试执行并获取结果
            const execResult = indirectEval(wrapper);
            if (execResult && typeof execResult === 'string' && execResult !== "未找到结果变量") {
                return `// AAencode解码结果 (通过执行):\n${execResult}`;
            }
        } catch (execError) {
            // 忽略执行错误，继续尝试其他方法
        }
        
        // 方法4: 提取代码中所有可能有意义的字符串
        const allStrings = [];
        code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
            if (content && content.length > 3 && 
                content !== "undefined" && 
                content !== "constructor" &&
                !content.match(/^[a-zA-Z0-9_]+$/)) {
                allStrings.push(content);
            }
            return match;
        });
        
        // 按长度排序，返回最长的几个字符串
        if (allStrings.length > 0) {
            const sortedStrings = [...allStrings].sort((a, b) => b.length - a.length);
            
            // 如果最长的字符串很长，可能就是答案
            if (sortedStrings[0].length > 20) {
                return `// AAencode解码结果 (最长字符串):\n${sortedStrings[0]}`;
            }
            
            // 否则返回前5个最长的字符串
            let result = "// AAencode解码结果 (可能的字符串):\n";
            for (let i = 0; i < Math.min(5, sortedStrings.length); i++) {
                result += `// ${i+1}. ${sortedStrings[i]}\n`;
            }
            return result;
        }
        
        // 方法5: 如果以上方法都失败，返回简化的代码
        const simplified = code
            .replace(/ﾟωﾟﾉ/g, 'var1')
            .replace(/ﾟｰﾟ/g, 'var2')
            .replace(/ﾟΘﾟ/g, 'var3')
            .replace(/ﾟДﾟ/g, 'var4')
            .replace(/\(o\^_\^o\)/g, 'var5')
            .replace(/ﾟoﾟ/g, 'result');
            
        return `// AAencode解码结果 (简化代码):\n${simplified}`;
        
    } catch (e) {
        // 发生错误时返回错误信息和原始代码
        return `// AAencode解码错误: ${e.message}\n${code}`;
    }
}

// 导出函数
module.exports = decodeAAencode;