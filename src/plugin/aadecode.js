/**
 * 纯粹的 AAEncode 解码器
 * 专门用于解码日语颜文字(Kaomoji)混淆的 JavaScript
 */

// 判断是否为 Node.js 环境
const isNode = typeof module !== 'undefined' && module.exports;

/**
 * 解码 AAEncode 混淆的 JavaScript
 * @param {string} code - 被混淆的代码
 * @returns {string} - 解码后的代码或原始代码
 */
function decodeAAencode(code) {
    try {
        // 检查是否是 AAEncode 混淆
        if (!code || typeof code !== 'string' || !isAAEncode(code)) {
            return code;
        }

        console.log('[AAEncode] 检测到 AAEncode 混淆，尝试解密...');

        // 递归解包
        const decrypted = recursiveUnpack(code);
        
        if (decrypted && decrypted !== code) {
            console.log('[AAEncode] 通过提取最终字符串成功解密');
            return decrypted;
        }
        
        console.log('[AAEncode] 解密失败，返回原始代码');
        return code;
    } catch (error) {
        console.error('[AAEncode] 处理时发生错误:', error);
        return code;
    }
}

/**
 * 检测代码是否为 AAEncode 混淆
 * @param {string} code - 要检查的代码
 * @returns {boolean} - 是否为 AAEncode 混淆
 */
function isAAEncode(code) {
    return /ﾟωﾟﾉ\s*=/.test(code) && 
           (/\(ﾟДﾟ\)/.test(code) || /\(ﾟΘﾟ\)/.test(code));
}

/**
 * 解包 AAEncode 混淆的代码
 * @param {string} packedCode - 混淆的代码
 * @returns {string|null} - 解包后的代码或 null
 */
function unpack(packedCode) {
    let unpacked = '';
    
    // 创建一个假的 eval 函数捕获结果
    const fakeEval = function(code) {
        unpacked = code;
        return code;
    };
    
    // 替换最终的执行函数
    const modifiedCode = packedCode.replace(/eval\s*\(/, 'fakeEval(');
    
    try {
        // 创建执行上下文
        const context = {
            fakeEval: fakeEval,
            String: String,
            RegExp: RegExp
        };
        
        // 使用 with 语句执行修改后的代码
        with(context) {
            eval(modifiedCode);
        }
        
        // 如果成功解包，返回结果
        if (unpacked) {
            return unpacked;
        }
        
        // 尝试直接提取字符串
        return extractFinalString(packedCode);
    } catch(e) {
        console.log('[AAEncode] 解包错误:', e);
        
        // 解包失败时尝试提取字符串
        return extractFinalString(packedCode);
    }
}

/**
 * 尝试提取 AAEncode 混淆中的最终字符串
 * @param {string} code - AAEncode 混淆代码
 * @returns {string|null} - 提取的字符串或 null
 */
function extractFinalString(code) {
    // 多种匹配模式
    const patterns = [
        // 标准 AAEncode 结尾模式
        /\(ﾟДﾟ\)\s*\[\s*ﾟoﾟ\s*\]\s*\)\s*\(\s*ﾟΘﾟ\s*\)\s*\)\s*\(\s*['"](.+?)['"]\s*\)/,
        
        // 函数调用结尾模式
        /\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\]\s*\(\s*\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\][^)]*\)\s*\(\s*ﾟΘﾟ\s*\)\s*\)\s*\(\s*['"](.+?)['"]\s*\)/,
        
        // 简单字符串结尾模式
        /\(['"]([^'"]+)['"]\)\s*;?\s*$/,
        
        // 另一种调用模式
        /\(ﾟДﾟ\)\s*\[\s*'_'\s*\]\s*\([^)]+\)\s*\(ﾟΘﾟ\)\)\s*\(\s*['"]([^"']+)['"]\s*\)/
    ];
    
    for (const pattern of patterns) {
        try {
            const match = code.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        } catch (e) {
            // 忽略单个正则匹配错误，继续尝试其他模式
            continue;
        }
    }
    
    return null;
}

/**
 * 递归解包混淆代码
 * @param {string} code - 混淆的代码
 * @param {number} depth - 当前解包深度
 * @returns {string} - 解包后的代码
 */
function recursiveUnpack(code, depth = 0) {
    if (depth > 10) return code;
    
    console.log(`[AAEncode] 进行第 ${depth + 1} 层解包...`);
    
    try {
        let result = unpack(code);
        if (result && result !== code) {
            if (result.includes('eval(')) {
                return recursiveUnpack(result, depth + 1);
            }
            return result;
        }
    } catch(e) {
        console.log(`[AAEncode] 第 ${depth + 1} 层解包失败:`, e);
    }
    
    return code;
}

// 导出模块
if (isNode) {
    module.exports = decodeAAencode;
} else {
    // ES模块导出
    export default decodeAAencode;
}