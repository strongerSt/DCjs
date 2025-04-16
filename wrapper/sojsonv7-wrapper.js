// SOJSON v7混淆解密插件 - 改进版 (专门处理jsjiami.com.v7)
console.log("SOJSON v7解密插件加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.sojsonv7 = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        
        // 检测jsjiami.com.v7特定混淆特征
        return code.indexOf('jsjiami.com.v7') !== -1 || 
               (code.indexOf('_0x') !== -1 && 
                code.indexOf('function _0x') !== -1 && 
                code.indexOf('var _0x') !== -1 && 
                code.indexOf('return _0x') !== -1);
    },
    
    plugin: function(code) {
        try {
            if (!this.detect(code)) {
                return code;
            }
            
            console.log("开始处理SOJSON v7加密代码");
            
            // 1. 处理十六进制字符串
            code = this.decodeHex(code);
            
            // 2. 提取并处理字符串数组
            code = this.processStringArrays(code);
            
            // 3. 处理解码函数
            code = this.processDecodeFunctions(code);
            
            // 4. 清理代码
            code = this.cleanCode(code);
            
            console.log("SOJSON v7代码处理完成");
            return code;
        } catch (e) {
            console.error("SOJSON v7解密错误:", e);
            return code; // 出错时返回原始代码
        }
    },
    
    // 解码十六进制字符串 \x形式
    decodeHex: function(code) {
        return code.replace(/\\x([0-9A-Fa-f]{2})/g, function(match, hex) {
            try {
                return String.fromCharCode(parseInt(hex, 16));
            } catch (e) {
                return match;
            }
        });
    },
    
    // 处理字符串数组
    processStringArrays: function(code) {
        // 查找类似: var _0x5d87=['xxx','yyy']
        var arrayRegex = /var\s+(_0x[a-f0-9]{4,})\s*=\s*\[\s*([^\]]+)\s*\]/g;
        var match;
        
        while ((match = arrayRegex.exec(code)) !== null) {
            try {
                var arrayName = match[1];
                var arrayStr = "[" + match[2] + "]";
                var array;
                
                try {
                    // 安全地执行数组定义
                    array = new Function("return " + arrayStr)();
                } catch (e) {
                    console.log("解析字符串数组失败: " + e.message);
                    continue;
                }
                
                // 替换直接索引引用，如 _0x5d87[0] => '实际字符串'
                for (var i = 0; i < array.length; i++) {
                    if (typeof array[i] === 'string') {
                        var pattern = new RegExp(arrayName + '\\[' + i + '\\]', 'g');
                        var replacement = JSON.stringify(array[i]);
                        code = code.replace(pattern, replacement);
                    }
                }
                
                console.log("处理了字符串数组: " + arrayName + " (包含 " + array.length + " 项)");
            } catch (e) {
                console.log("处理字符串数组时出错: " + e.message);
            }
        }
        
        return code;
    },
    
    // 处理解码函数
    processDecodeFunctions: function(code) {
        // 查找典型的解码函数
        var funcRegex = /function\s+(_0x[a-f0-9]+)\s*\(\s*(?:_0x[a-f0-9]+)?\s*\)\s*\{\s*(?:var\s+[^;]+;)?\s*return\s+([^;]+);\s*\}/g;
        var functions = {};
        var match;
        
        while ((match = funcRegex.exec(code)) !== null) {
            var functionName = match[1];
            var returnExpr = match[2];
            functions[functionName] = returnExpr;
        }
        
        // 替换这些函数的简单调用
        for (var funcName in functions) {
            try {
                // 替换不带参数的函数调用
                var simpleCallPattern = new RegExp(funcName + '\\(\\)', 'g');
                code = code.replace(simpleCallPattern, '(' + functions[funcName] + ')');
                
                // 尝试替换带一个字符串参数的调用，如 _0x12345('abc')
                var stringCallPattern = new RegExp(funcName + '\\([\'"]([^\'"]+)[\'"]\\)', 'g');
                var stringCallMatch;
                
                while ((stringCallMatch = stringCallPattern.exec(code)) !== null) {
                    var originalCall = stringCallMatch[0];
                    var param = stringCallMatch[1];
                    // 替换为字符串字面量
                    code = code.replace(new RegExp(this.escapeRegExp(originalCall), 'g'), JSON.stringify(param));
                }
            } catch (e) {
                console.log("替换函数调用时出错: " + e.message);
            }
        }
        
        return code;
    },
    
    // 清理代码
    cleanCode: function(code) {
        // 移除版本标记
        code = code.replace(/var\s+version_\s*=\s*['"]jsjiami\.com\.v7['"];?\s*/g, '');
        code = code.replace(/var\s+version_\s*=\s*['"]sojson\.v7['"];?\s*/g, '');
        
        // 去除注释标记
        code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v7[\s\S]*?\*\//g, "");
        code = code.replace(/\/\*\*[\s\S]*?sojson\.v7[\s\S]*?\*\//g, "");
        code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v7.*$/gm, "");
        code = code.replace(/\/\/[\s\S]*?sojson\.v7.*$/gm, "");
        
        return code;
    },
    
    // 辅助函数：转义正则表达式特殊字符
    escapeRegExp: function(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};

console.log("SOJSON v7解密插件加载完成");