// SOJSON v7混淆解密插件 - 增强版
console.log("SOJSON v7解密插件加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.sojsonv7 = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        
        // SOJSON v7特征
        return code.includes('jsjiami.com.v7') || 
               code.includes('sojson.v7') || 
               (code.includes('_0x') && code.includes('fromCharCode') && code.includes('decode'));
    },
    
    plugin: function(code) {
        try {
            if (!this.detect(code)) {
                return code;
            }
            
            console.log("开始处理SOJSON v7加密代码");
            
            // 去除特征标记
            code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v7[\s\S]*?\*\//g, "");
            code = code.replace(/\/\*\*[\s\S]*?sojson\.v7[\s\S]*?\*\//g, "");
            code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v7.*$/gm, "");
            code = code.replace(/\/\/[\s\S]*?sojson\.v7.*$/gm, "");
            
            // 查找字符串数组并替换
            var stringArrayRegex = /var\s+(_0x[a-f0-9]{4,})\s*=\s*\[\s*([^\]]*)\s*\]/g;
            var match;
            
            while ((match = stringArrayRegex.exec(code)) !== null) {
                try {
                    var arrayName = match[1];
                    var arrayContent = match[2];
                    var arrayStr = "[" + arrayContent + "]";
                    
                    // 安全地执行数组定义
                    var array;
                    try {
                        array = new Function("return " + arrayStr)();
                    } catch (e) {
                        console.log("字符串数组解析失败: " + e.message);
                        continue;
                    }
                    
                    // 替换简单引用
                    for (var i = 0; i < array.length; i++) {
                        var pattern = new RegExp(arrayName + '\\[' + i + '\\]', 'g');
                        if (typeof array[i] === 'string') {
                            var replacement = '"' + array[i].replace(/"/g, '\\"') + '"';
                            code = code.replace(pattern, replacement);
                        }
                    }
                    
                    console.log("替换了 " + array.length + " 个字符串引用");
                } catch (e) {
                    console.log("处理字符串数组时出错: " + e.message);
                }
            }
            
            // 处理常见的字符串解码函数
            var decodeFunctionRegex = /function\s+(_0x[a-f0-9]+)\s*\(\s*(?:_0x[a-f0-9]+)?\s*\)\s*\{\s*(?:var\s+[^;]+;)?\s*return\s+([^;]+);\s*\}/g;
            var decodeFunctions = {};
            
            while ((match = decodeFunctionRegex.exec(code)) !== null) {
                var funcName = match[1];
                var returnExpr = match[2];
                decodeFunctions[funcName] = returnExpr;
                console.log("发现解码函数: " + funcName);
            }
            
            // 尝试替换函数调用
            for (var funcName in decodeFunctions) {
                try {
                    var funcCallRegex = new RegExp(funcName + '\\(["\']([^"\']+)["\']\\)', 'g');
                    while ((match = funcCallRegex.exec(code)) !== null) {
                        var origCall = match[0];
                        var param = match[1];
                        
                        // 简单替换，这里不执行实际解码，因为通常需要完整的上下文
                        code = code.replace(new RegExp(escapeRegExp(origCall), 'g'), '"' + param + '"');
                        console.log("替换函数调用: " + origCall);
                    }
                } catch (e) {
                    console.log("替换函数调用时出错: " + e.message);
                }
            }
            
            // 尝试解码Base64
            var base64Regex = /['"]([A-Za-z0-9+/]{40,})['"]/g;
            while ((match = base64Regex.exec(code)) !== null) {
                try {
                    var base64Str = match[1];
                    if (isBase64(base64Str)) {
                        console.log("发现Base64字符串");
                    }
                } catch (e) {
                    // 忽略错误
                }
            }
            
            // 尝试解码Unicode转义序列
            code = code.replace(/\\u([0-9a-fA-F]{4})/g, function(match, p1) {
                try {
                    return String.fromCharCode(parseInt(p1, 16));
                } catch (e) {
                    return match;
                }
            });
            
            console.log("SOJSON v7代码处理完成");
            return code;
        } catch (e) {
            console.error("SOJSON v7解密错误:", e);
            return code; // 出错时返回原始代码
        }
    }
};

// 辅助函数
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isBase64(str) {
    try {
        return btoa(atob(str)) === str;
    } catch (e) {
        return false;
    }
}

console.log("SOJSON v7解密插件加载完成");