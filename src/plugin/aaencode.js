/**
 * AAencode (颜文字JavaScript) 解密插件
 * 用于解密使用日语片假名字符混淆的JavaScript代码
 */
function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }

    try {
        // 将代码包装在函数中执行，并尝试提取结果
        const wrappedCode = `
            let result;
            try {
                ${code}
                // AAencode通常将结果赋值给变量 ﾟoﾟ
                if (typeof ﾟoﾟ !== "undefined") {
                    result = ﾟoﾟ;
                } else {
                    // 尝试其他可能的输出变量
                    result = (typeof ___ !== "undefined") ? ___ : code;
                }
            } catch(e) {
                result = "AAencode解密错误: " + e.message;
            }
            return result;
        `;
        
        // 安全执行代码
        const decodedResult = new Function(wrappedCode)();
        
        // 如果结果是字符串，直接返回
        if (typeof decodedResult === 'string') {
            return decodedResult;
        }
        
        // 如果结果是对象，尝试将其转换为字符串或JSON
        if (typeof decodedResult === 'object' && decodedResult !== null) {
            try {
                return JSON.stringify(decodedResult, null, 2);
            } catch (e) {
                return String(decodedResult);
            }
        }
        
        // 其他类型的结果
        return String(decodedResult);
    } catch (e) {
        console.error("AAencode解密失败:", e.message);
        return code; // 解密失败，返回原代码
    }
}

module.exports = decodeAAencode;
