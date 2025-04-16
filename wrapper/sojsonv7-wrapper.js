// SOJSON v7混淆解密插件 - 专门版
console.log("SOJSON v7解密插件(专门版)加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.sojsonv7 = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        
        // 更精确地检测jsjiami.com.v7特定混淆特征
        return (code.indexOf('jsjiami.com.v7') !== -1 || 
               (code.indexOf('_0x') !== -1 && 
                code.indexOf('function _0x') !== -1 && 
                code.indexOf('gsMCfG') !== -1)) && 
               code.indexOf('\\x') !== -1;  // 特别关注十六进制编码
    },
    
    plugin: function(code) {
        try {
            if (!this.detect(code)) {
                return code;
            }
            
            console.log("开始处理SOJSON v7加密代码");
            
            // 首先处理十六进制编码的字符串
            var hexResult = this.decodeHexStrings(code);
            if (hexResult !== code) {
                console.log("成功解码十六进制字符串");
                code = hexResult;
            }
            
            // 处理_0x46b1函数
            code = this.process_0x46b1Function(code);
            
            // 提取并处理字符串数组
            code = this.processStringArrays(code);
            
            // 处理解码函数
            code = this.processDecodeFunctions(code);
            
            // 处理特定的模式 - 针对示例代码中的模式
            code = this.processSpecificPatterns(code);
            
            // 清理代码
            code = this.cleanCode(code);
            
            console.log("SOJSON v7代码处理完成");
            return code;
        } catch (e) {
            console.error("SOJSON v7解密错误:", e);
            return code; // 出错时返回原始代码
        }
    },
    
    // 解码\\x形式的十六进制字符串
    decodeHexStrings: function(code) {
        // 匹配 '\\x6a\\x73\\x6a\\x69\\x61...' 形式的字符串
        var hexStringRegex = /['"]\\x([0-9a-fA-F]{2})(?:\\x([0-9a-fA-F]{2}))*['"]/g;
        
        return code.replace(hexStringRegex, function(match) {
            try {
                // 去掉引号
                match = match.substring(1, match.length - 1);
                
                // 将每个 \\x 替换为实际字符
                var decodedStr = match.replace(/\\x([0-9a-fA-F]{2})/g, function(_, hex) {
                    return String.fromCharCode(parseInt(hex, 16));
                });
                
                return '"' + decodedStr + '"';
            } catch (e) {
                console.log("十六进制解码错误:", e);
                return match;
            }
        });
    },
    
    // 处理 _0x46b1 或类似函数
    process_0x46b1Function: function(code) {
        // 尝试查找类似 function _0x46b1() { ... } 的函数
        var funcRegex = /function\s+(_0x[a-f0-9]+)\s*\(\s*\)\s*\{\s*var\s+(_0x[a-f0-9]+)\s*=\s*\[((?:'[^']*'|"[^"]*"|\s*,\s*)*)\]/;
        var match = funcRegex.exec(code);
        
        if (match) {
            try {
                var funcName = match[1];
                var arrVarName = match[2];
                var arrContent = match[3];
                
                // 处理数组内容
                var array;
                try {
                    var arrayStr = "[" + arrContent + "]";
                    array = new Function("return " + arrayStr)();
                    console.log("成功提取 " + funcName + " 函数的数组");
                    
                    // 查找 _0x46b1(0x18f) 这样的调用并替换
                    var callRegex = new RegExp(funcName + '\\((0x[0-9a-fA-F]+)\\)', 'g');
                    code = code.replace(callRegex, function(_, index) {
                        var idx = parseInt(index, 16) - 0x18f; // 根据示例代码调整
                        if (idx >= 0 && idx < array.length) {
                            return JSON.stringify(array[idx]);
                        }
                        return _;
                    });
                    
                    console.log("替换了 " + funcName + " 函数调用");
                } catch (e) {
                    console.log("处理 " + funcName + " 数组时出错:", e);
                }
            } catch (e) {
                console.log("处理 _0x46b1 函数时出错:", e);
            }
        }
        
        return code;
    },
    
    // 处理字符串数组
    processStringArrays: function(code) {
        // 处理 var _0x30a670=['a','b','c'] 形式的数组
        var arrayRegex = /var\s+(_0x[a-f0-9]{4,})\s*=\s*\[\s*([^\]]+)\s*\]/g;
        var match;
        
        while ((match = arrayRegex.exec(code)) !== null) {
            try {
                var arrayName = match[1];
                var arrayStr = "[" + match[2] + "]";
                var array;
                
                try {
                    array = new Function("return " + arrayStr)();
                } catch (e) {
                    console.log("解析字符串数组失败:", e);
                    continue;
                }
                
                // 替换直接索引引用
                for (var i = 0; i < array.length; i++) {
                    if (typeof array[i] === 'string') {
                        var pattern = new RegExp(arrayName + '\\[' + i + '\\]', 'g');
                        var replacement = JSON.stringify(array[i]);
                        code = code.replace(pattern, replacement);
                    }
                }
                
                console.log("处理了字符串数组: " + arrayName);
            } catch (e) {
                console.log("处理字符串数组时出错:", e);
            }
        }
        
        return code;
    },
    
    // 处理解码函数
    processDecodeFunctions: function(code) {
        // 查找 _0x1fca 类型的函数
        var decodeFuncRegex = /function\s+(_0x[a-f0-9]+)\s*\(\s*(_0x[a-f0-9]+)\s*,\s*(_0x[a-f0-9]+)\s*\)\s*\{[^}]+return\s+[^;]+;?\s*\}/g;
        var match;
        
        while ((match = decodeFuncRegex.exec(code)) !== null) {
            var funcName = match[1];
            console.log("找到解码函数: " + funcName);
            
            // 查找这个函数的调用
            var callRegex = new RegExp('var\\s+[^=]+=\\s*' + funcName + '\\(([^,]+),\\s*([^)]+)\\)', 'g');
            code = code.replace(callRegex, function(fullMatch) {
                // 这里我们只是标记这个调用，但并不尝试执行替换
                // 因为这些函数通常很复杂，需要完整的执行环境
                console.log("找到 " + funcName + " 函数调用");
                return fullMatch;
            });
        }
        
        return code;
    },
    
    // 处理特定的模式 - 专门针对示例中的模式
    processSpecificPatterns: function(code) {
        // 处理 gsMCfG 相关的代码模式
        if (code.indexOf('gsMCfG') !== -1) {
            // 这里添加特定于 gsMCfG 模式的处理
            console.log("检测到 gsMCfG 特征模式");
            
            // 处理 _0x451932 函数 (常见的Base64/解码函数)
            var base64FuncRegex = /var\s+(_0x[a-f0-9]+)\s*=\s*function\s*\((_0x[a-f0-9]+)\)\s*\{\s*var\s+(_0x[a-f0-9]+)\s*=\s*['"]abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\+\/=['"]/;
            var base64Match = base64FuncRegex.exec(code);
            
            if (base64Match) {
                var base64FuncName = base64Match[1];
                console.log("找到Base64解码函数: " + base64FuncName);
                
                // 我们标记但不执行实际替换，因为这需要完整执行环境
            }
        }
        
        return code;
    },
    
    // 清理代码
    cleanCode: function(code) {
        // 移除版本标记
        code = code.replace(/var\s+version_\s*=\s*(['"])\\x[^'"]*\1;?\s*/g, '');
        
        // 去除注释标记
        code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v7[\s\S]*?\*\//g, "");
        
        return code;
    }
};

console.log("SOJSON v7解密插件(专门版)加载完成");