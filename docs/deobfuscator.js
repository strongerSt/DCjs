// browser-deobfuscator.js
// 浏览器端JS解密工具库

/**
 * JJEncode解密函数
 * 用于解密JJEncode混淆的JavaScript代码
 */
function deobfuscateJJEncode(code) {
    // 检查是否是JJEncode
    if (!code.includes('ﾟωﾟﾉ') && !code.includes('ﾟДﾟ') && !code.includes('ﾟΘﾟ')) {
        return code; // 不是JJEncode，返回原代码
    }
    
    try {
        // 提取可执行的JJEncode代码
        let match = code.match(/(.+?=~\[\];\s*.+?;\s*.+?=\(.+?\)\(\);)/);
        if (match) {
            let jjcode = match[1];
            
            // 创建一个安全的执行环境
            let sandbox = {
                result: '',
                console: {
                    log: function(str) {
                        this.result += str + '\n';
                    }.bind(sandbox)
                },
                document: {
                    write: function(str) {
                        this.result += str;
                    }.bind(sandbox)
                },
                window: {},
                eval: function(code) {
                    try {
                        new Function(code)();
                    } catch (e) {
                        console.error("JJEncode执行错误:", e);
                    }
                }
            };
            
            // 预处理代码，添加结果捕获
            let evalCode = `
                try {
                    ${jjcode}
                    if (typeof _ !== 'undefined') console.log(_);
                } catch(e) {
                    console.error("JJEncode执行错误:", e);
                }
            `;
            
            // 执行带有沙箱的代码
            try {
                new Function('console', 'document', 'window', evalCode)(
                    sandbox.console, sandbox.document, sandbox.window
                );
                return sandbox.result || "JJEncode解密未能返回结果，请尝试其他方法";
            } catch (e) {
                return "JJEncode解密失败: " + e.message;
            }
        }
        return "无法识别JJEncode模式";
    } catch (error) {
        return "JJEncode解密错误: " + error.message;
    }
}

/**
 * 通用JavaScript混淆解密函数
 * 处理常见的JavaScript混淆模式
 */
function deobfuscateCommon(code) {
    try {
        // 处理十六进制字符串字面量
        let step1 = code.replace(/\\x([0-9A-Fa-f]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
        
        // 处理Unicode转义序列
        let step2 = step1.replace(/\\u([0-9A-Fa-f]{4})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
        
        // 处理常见的十六进制变量命名模式 (_0x12ab34)
        let step3 = step2.replace(/_0x([0-9a-f]{4,6})/g, (match, p1) => {
            return `_dec_${p1}`;
        });
        
        // 处理数组索引访问，例如：_0x123abc[0x1]
        let step4 = step3.replace(/\[0x([0-9a-f]+)\]/g, (match, p1) => {
            return `[${parseInt(p1, 16)}]`;
        });
        
        // 尝试简化字符串拼接表达式
        let step5 = step4.replace(/'([^']*)'\s*\+\s*'([^']*)'/g, (match, p1, p2) => {
            return `'${p1}${p2}'`;
        });
        
        return step5;
    } catch (error) {
        return "通用解密错误: " + error.message;
    }
}

/**
 * Sojson混淆解密函数
 */
function deobfuscateSojson(code) {
    try {
        // 检查是否是Sojson
        if (!code.includes('_0x') && !code.includes('var _0x')) {
            return code; // 不是Sojson，返回原代码
        }
        
        // 提取并替换十六进制字面量
        let step1 = code.replace(/\\x([0-9A-Fa-f]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
        
        // 尝试解析和替换字符串数组
        let arrayPattern = /var\s+(_0x[a-f0-9]+)\s*=\s*\[([^\]]+)\]/;
        let arrayMatch = code.match(arrayPattern);
        
        if (arrayMatch) {
            let arrayName = arrayMatch[1];
            let arrayContent = arrayMatch[2];
            
            // 解析数组内容
            let strings = arrayContent.split(',').map(item => {
                item = item.trim();
                // 移除引号
                if ((item.startsWith("'") && item.endsWith("'")) || 
                    (item.startsWith('"') && item.endsWith('"'))) {
                    return item.substring(1, item.length - 1);
                }
                return item;
            });
            
            // 替换数组引用
            let arrayRefPattern = new RegExp(arrayName + '\\[(\\d+)\\]', 'g');
            step1 = step1.replace(arrayRefPattern, (match, index) => {
                let idx = parseInt(index, 10);
                if (idx < strings.length) {
                    return `'${strings[idx]}'`;
                }
                return match;
            });
        }
        
        // 使用通用解密进一步处理
        return deobfuscateCommon(step1);
    } catch (error) {
        return "Sojson解密错误: " + error.message;
    }
}

/**
 * Sojson V7混淆解密函数
 */
function deobfuscateSojsonV7(code) {
    // V7版本特有的特征检测
    if (!code.includes('_0x') || !code.includes('shift')) {
        return deobfuscateSojson(code); // 降级到常规Sojson
    }
    
    try {
        // 首先应用通用Sojson解密
        let firstPass = deobfuscateSojson(code);
        
        // 针对V7特有的编码模式进行处理
        let secondPass = firstPass.replace(/function\s+(_0x[a-f0-9]+)\(\)\s*{\s*(_0x[a-f0-9]+)\[\'push\'\]\((_0x[a-f0-9]+)\[\'shift\'\]\(\)\);\s*}/g, 
            'function $1() { /* Array manipulation simplified */ }');
        
        return secondPass;
    } catch (error) {
        return "SojsonV7解密错误: " + error.message;
    }
}

/**
 * JavaScript-Obfuscator解密函数
 */
function deobfuscateJSObfuscator(code) {
    try {
        // 检查是否是JS-Obfuscator
        if (!code.includes('_0x') && !code.includes('constructor')) {
            return code; // 不是JS-Obfuscator，返回原代码
        }
        
        // 处理字符串数组
        let step1 = deobfuscateCommon(code);
        
        // 处理JS-Obfuscator特有的self-defending代码
        let step2 = step1.replace(/\(function\s*\([^)]*\)\s*{\s*(?:['"]use strict['"];)?\s*(?:var|let|const)\s+[a-zA-Z0-9_$]+\s*=\s*\{\};\s*.*?debugger;\s*.*?\}\s*\([^)]*\)\);/gs, 
            '/* Self-defending code removed */');
        
        // 处理特有的数组重排列操作
        let step3 = step2.replace(/(?:var|let|const)\s+([a-zA-Z0-9_$]+)\s*=\s*\[\];\s*(?:(?:var|let|const)\s+)?[a-zA-Z0-9_$]+\s*=\s*function\s*\(\)\s*{\s*([a-zA-Z0-9_$]+)(?:\[['"]push['"]\])\(([a-zA-Z0-9_$]+)(?:\[['"]shift['"]\])\(\)\);\s*\};/g, 
            '/* Array manipulation removed */');
        
        return step3;
    } catch (error) {
        return "JS-Obfuscator解密错误: " + error.message;
    }
}

/**
 * 阿里云AWSC解密函数
 */
function deobfuscateAwsc(code) {
    try {
        // 检查是否含有AWSC特征
        if (!code.includes('umidToken') && !code.includes('ua=')) {
            return code; // 不是AWSC，返回原代码
        }
        
        // 处理AWSC典型的混淆特征
        let deobfuscated = code;
        
        // 处理URI编码的字符串
        deobfuscated = deobfuscated.replace(/(?:%[0-9A-Fa-f]{2})+/g, match => {
            try {
                return decodeURIComponent(match);
            } catch (e) {
                return match;
            }
        });
        
        // 应用通用解密
        return deobfuscateCommon(deobfuscated);
    } catch (error) {
        return "AWSC解密错误: " + error.message;
    }
}

/**
 * Part2AI解密函数
 */
function deobfuscatePart2AI(code) {
    try {
        // 通常包含BASE64或其他特征
        if (!code.includes('atob') && !code.includes('base64')) {
            return code; // 不是Part2AI，返回原代码
        }
        
        // 查找并解码base64字符串
        let base64Pattern = /['"]([A-Za-z0-9+/=]+)['"]/g;
        let deobfuscated = code.replace(base64Pattern, (match, encoded) => {
            try {
                // 检查是否是有效的base64
                if (/^[A-Za-z0-9+/=]+$/.test(encoded)) {
                    let decoded = atob(encoded);
                    // 只返回可读的字符串
                    if (/^[\x20-\x7E]+$/.test(decoded)) {
                        return `'${decoded}'`;
                    }
                }
                return match;
            } catch (e) {
                return match;
            }
        });
        
        // 处理eval和Function构造
        deobfuscated = deobfuscated.replace(/eval\((.*?)\)/g, '/* eval removed: */ ($1)');
        
        // 应用通用解密
        return deobfuscateCommon(deobfuscated);
    } catch (error) {
        return "Part2AI解密错误: " + error.message;
    }
}

/**
 * 自动检测混淆类型并调用相应的解密函数
 */
function autoDetectAndDeobfuscate(code) {
    // 检测代码类型
    if (code.includes('ﾟωﾟﾉ') || code.includes('ﾟΘﾟ') || code.includes('ﾟДﾟ')) {
        return deobfuscateJJEncode(code);
    } else if (code.includes('window["\x73\x6f\x6a\x73\x6f\x6e"]') || (code.includes('_0x') && code.includes('shift'))) {
        return deobfuscateSojsonV7(code);
    } else if (code.includes('_0x') && code.includes('var _0x')) {
        return deobfuscateSojson(code);
    } else if (code.includes('constructor') && code.includes('while (true)')) {
        return deobfuscateJSObfuscator(code);
    } else if (code.includes('umidToken') || code.includes('ua=')) {
        return deobfuscateAwsc(code);
    } else if (code.includes('atob') || code.includes('base64')) {
        return deobfuscatePart2AI(code);
    } else {
        // 默认使用通用解密
        return deobfuscateCommon(code);
    }
}

// 导出解密函数
window.browserDeobfuscator = {
    deobfuscateJJEncode,
    deobfuscateCommon,
    deobfuscateSojson,
    deobfuscateSojsonV7,
    deobfuscateJSObfuscator,
    deobfuscateAwsc,
    deobfuscatePart2AI,
    autoDetectAndDeobfuscate
};
