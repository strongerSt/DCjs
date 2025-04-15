/**
 * AADecode 解码插件
 * 用于解码 AAEncode 混淆的 JavaScript 代码
 */

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
 * 解包 AAEncode 混淆的代码
 * @param {string} packedCode - 混淆的代码
 * @returns {string|null} - 解包后的代码或 null
 */
function unpack(packedCode) {
    // 首先尝试提取字符串方法
    const extractedString = extractFinalString(packedCode);
    if (extractedString) {
        return extractedString;
    }
    
    // 如果提取失败，尝试模拟执行方法
    let unpacked = '';
    
    // 创建一个假的 eval 函数捕获结果
    const fakeEval = function(code) {
        unpacked = code;
        return code;
    };
    
    // 替换最终的执行函数
    // AAEncode 通常使用 (ﾟДﾟ)['_'] 或类似的方式来执行代码
    let modifiedCode = packedCode;
    
    // 替换 eval 调用
    modifiedCode = modifiedCode.replace(/eval\s*\(/, 'fakeEval(');
    
    // 替换 (ﾟДﾟ)['_'] 调用
    modifiedCode = modifiedCode.replace(
        /\(ﾟДﾟ\)\s*\[\s*['"]?_['"]?\s*\]\s*\(/g, 
        'fakeEval('
    );
    
    try {
        // 创建一个Function来执行代码，避免使用with和直接eval
        const safeExec = new Function('fakeEval', 'String', 'RegExp', modifiedCode);
        
        // 执行修改后的代码
        safeExec(fakeEval, String, RegExp);
        
        // 如果成功解包，返回结果
        if (unpacked) {
            return unpacked;
        }
        
        return null;
    } catch(e) {
        console.log('[AAEncode] 执行解包错误:', e);
        return null;
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

// 导出插件函数
module.exports = decodeAAencode;