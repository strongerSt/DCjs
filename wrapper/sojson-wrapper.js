// SOJSON混淆解密插件 - 增强版
console.log("SOJSON解密插件加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.sojson = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        
        // 检测SOJSON v6特征
        return (code.indexOf('_0x') !== -1) && 
               (code.indexOf('var _0x') !== -1) && 
               !code.includes('jsjiami.com.v7') && 
               !code.includes('sojson.v7');
    },
    
    plugin: function(code) {
        try {
            if (!this.detect(code)) {
                return code;
            }
            
            console.log("开始处理SOJSON加密代码");
            
            // 去除特征标记
            code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v6[\s\S]*?\*\//g, "");
            code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v6.*$/gm, "");
            
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
            
            // 尝试简化十六进制值
            code = code.replace(/\\x([0-9A-Fa-f]{2})/g, function(match, p1) {
                try {
                    return String.fromCharCode(parseInt(p1, 16));
                } catch (e) {
                    return match;
                }
            });
            
            // 尝试简化Unicode转义序列
            code = code.replace(/\\u([0-9a-fA-F]{4})/g, function(match, p1) {
                try {
                    return String.fromCharCode(parseInt(p1, 16));
                } catch (e) {
                    return match;
                }
            });
            
            // 处理解码函数
            var decodeFuncRegex = /function\s+(_0x[a-f0-9]+)\s*\(\s*\)\s*\{\s*(?:var\s+[^;]+;)?\s*return\s+([^;]+);\s*\}/g;
            var funcMatches = {};
            
            while ((match = decodeFuncRegex.exec(code)) !== null) {
                try {
                    var funcName = match[1];
                    var returnExpr = match[2];
                    funcMatches[funcName] = returnExpr;
                } catch (e) {
                    console.log("提取解码函数时出错: " + e.message);
                }
            }
            
            // 替换这些函数调用
            for (var funcName in funcMatches) {
                var pattern = new RegExp(funcName + '\\(\\)', 'g');
                code = code.replace(pattern, "(" + funcMatches[funcName] + ")");
                console.log("替换了函数: " + funcName);
            }
            
            console.log("SOJSON代码处理完成");
            return code;
        } catch (e) {
            console.error("SOJSON解密错误:", e);
            return code; // 出错时返回原始代码
        }
    }
};

console.log("SOJSON解密插件加载完成");