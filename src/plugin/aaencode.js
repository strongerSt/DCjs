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
        // 创建一个安全的执行环境，预定义可能的未定义变量
        const wrappedCode = `
            // 预定义常见可能未定义的变量
            let $response = {};
            let $data = {};
            let $result = {};
            let $request = {};
            let $input = {};
            let $output = {};
            let $token = '';
            let $key = '';
            let $value = '';
            
            // 定义常见的全局对象，如果它们不存在
            if (typeof window === 'undefined') var window = {};
            if (typeof document === 'undefined') var document = { createElement: () => ({}) };
            if (typeof navigator === 'undefined') var navigator = { userAgent: '' };
            if (typeof location === 'undefined') var location = { href: '' };
            
            // 执行AAencode代码
            let result;
            try {
                ${code}
                // AAencode通常将结果赋值给变量 ﾟoﾟ
                if (typeof ﾟoﾟ !== "undefined") {
                    result = ﾟoﾟ;
                } else {
                    // 尝试遍历全局变量，寻找可能的结果
                    for (let key in this) {
                        if (key.includes('ﾟ') || key.includes('_') || key.includes('o')) {
                            if (typeof this[key] === 'string' || typeof this[key] === 'object') {
                                result = this[key];
                                break;
                            }
                        }
                    }
                    // 如果仍未找到结果
                    if (result === undefined) {
                        result = "无法找到AAencode的输出变量，请检查原始代码";
                    }
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
        
        // 第二种尝试方法：使用直接替换法
        try {
            // 尝试通过简单的正则替换提取可能的JavaScript代码
            // 此方法不执行代码，只尝试提取可能的有意义内容
            const extractedContent = code.replace(/ﾟ[\w\W]*?\(ﾟДﾟ\)\s*(?:'|")([^'"]*)(?:'|")/g, '$1');
            
            if (extractedContent !== code && extractedContent.length > 10) {
                return "// AAencode静态提取内容:\n" + extractedContent;
            }
            
            // 提取所有字符串字面量
            const stringLiterals = [];
            code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
                if (content.length > 5) stringLiterals.push(content);
                return match;
            });
            
            if (stringLiterals.length > 0) {
                return "// AAencode提取的字符串:\n" + stringLiterals.join("\n");
            }
        } catch (ex) {
            // 忽略第二次尝试的错误
        }
        
        return code; // 解密失败，返回原代码
    }
}

module.exports = decodeAAencode;
