// SOJSON v7混淆解密插件 - 专家版 (基于Flightradar24解密器)
console.log("SOJSON v7解密插件(专家版)加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.sojsonv7 = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        
        // 检测jsjiami.com.v7特定混淆特征
        return code.indexOf('jsjiami.com.v7') !== -1 || 
               code.indexOf('\\x6a\\x73\\x6a\\x69\\x61\\x6d\\x69') !== -1 ||
               (code.indexOf('_0x') !== -1 && 
                code.indexOf('function _0x') !== -1 && 
                code.indexOf('gsMCfG') !== -1);
    },
    
    plugin: function(code) {
        try {
            if (!this.detect(code)) {
                return code;
            }
            
            console.log("开始处理SOJSON v7加密代码");
            
            // 1. 解码十六进制编码的字符串 (如版本字符串)
            code = this.decodeHexStrings(code);
            
            // 2. 创建解密上下文
            window._sojsonv7_context = {
                decodedStrings: new Map()
            };
            
            // 3. 添加钩子函数
            code = this.addHooks(code);
            
            // 4. 处理字符串数组和常用模式
            code = this.processStringArrays(code);
            code = this.processCommonPatterns(code);
            
            // 5. 清理代码
            code = this.cleanCode(code);
            
            // 6. 添加带注释的解密工具函数
            code = this.addHelperComments(code);
            
            console.log("SOJSON v7代码处理完成");
            return code;
        } catch (e) {
            console.error("SOJSON v7解密错误:", e);
            return code; // 出错时返回原始代码
        }
    },
    
    // 解码\\x形式的十六进制字符串
    decodeHexStrings: function(code) {
        // 1. 处理版本字符串
        code = code.replace(/var\s+version_\s*=\s*['"]\\x([0-9a-fA-F]{2})((?:\\x[0-9a-fA-F]{2})+)['"]/g, function(match, firstHex, restHex) {
            try {
                let decoded = String.fromCharCode(parseInt(firstHex, 16));
                restHex.split('\\x').forEach(hex => {
                    if (hex.length >= 2) {
                        const charCode = parseInt(hex.substring(0, 2), 16);
                        decoded += String.fromCharCode(charCode);
                    }
                });
                
                console.log("解码版本字符串: " + decoded);
                return "var version_ = '" + decoded + "'; // 已解码";
            } catch (e) {
                console.log("解码版本字符串失败:", e);
                return match;
            }
        });
        
        // 2. 处理其他十六进制字符串
        code = code.replace(/(['"])\\x([0-9a-fA-F]{2})((?:\\x[0-9a-fA-F]{2})+)(['"])/g, function(match, q1, firstHex, restHex, q2) {
            try {
                let decoded = String.fromCharCode(parseInt(firstHex, 16));
                restHex.split('\\x').forEach(hex => {
                    if (hex.length >= 2) {
                        const charCode = parseInt(hex.substring(0, 2), 16);
                        decoded += String.fromCharCode(charCode);
                    }
                });
                
                return q1 + decoded + q2;
            } catch (e) {
                return match;
            }
        });
        
        return code;
    },
    
    // 添加各种钩子函数来监控解密过程
    addHooks: function(code) {
        // 1. 钩子Base64解码函数
        code = code.replace(
            /var\s+(_0x[a-f0-9]+)\s*=\s*function\s*\((_0x[a-f0-9]+)\)\s*\{\s*var\s+(_0x[a-f0-9]+)\s*=\s*['"]abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789\+\/=['"][\s\S]+?return\s+(?:decodeURIComponent|String\.fromCharCode)\((_0x[a-f0-9]+)\);?\s*\}/,
            function(match, funcName) {
                console.log(`找到Base64解码函数: ${funcName}`);
                return match + `
// Base64解码函数已标注
// ${funcName} 是Base64解码函数`;
            }
        );
        
        // 2. 钩子主解码函数 (_0x1fca)
        code = code.replace(
            /function\s+(_0x[a-f0-9]+)\s*\((_0x[a-f0-9]+),\s*(_0x[a-f0-9]+)\)\s*\{([\s\S]+?)return\s+(_0x[a-f0-9]+);?\s*\}/,
            function(match, funcName, arg1, arg2, body, returnVar) {
                console.log(`找到主解码函数: ${funcName}`);
                return match + `
// 主解码函数已标注
// ${funcName} 是主要的字符串解码函数，参数为 ${arg1}, ${arg2}`;
            }
        );
        
        // 3. 钩子字符串数组生成函数 (_0x46b1)
        code = code.replace(
            /function\s+(_0x[a-f0-9]+)\s*\(\s*\)\s*\{[\s\S]+?return\s+(_0x[a-f0-9]+);?\s*\}/,
            function(match, funcName, returnVar) {
                console.log(`找到字符串数组生成函数: ${funcName}`);
                return match + `
// 字符串数组生成函数已标注
// ${funcName} 返回包含加密字符串的数组`;
            }
        );
        
        return code;
    },
    
    // 处理字符串数组
    processStringArrays: function(code) {
        // 1. 尝试提取字符串数组
        var arrayMatch = code.match(/var\s+(_0x[a-f0-9]+)\s*=\s*\[\s*([^\]]+)\s*\]/);
        if (arrayMatch) {
            var arrayName = arrayMatch[1];
            var arrayContent = arrayMatch[2];
            
            try {
                var arrayStr = "[" + arrayContent + "]";
                var array = new Function("return " + arrayStr)();
                
                console.log(`找到字符串数组 ${arrayName}，包含 ${array.length} 项`);
                
                // 尝试替换直接的数组引用
                for (var i = 0; i < array.length; i++) {
                    if (typeof array[i] === 'string') {
                        var pattern = new RegExp(arrayName + '\\[' + i + '\\]', 'g');
                        var replacement = JSON.stringify(array[i]);
                        code = code.replace(pattern, replacement + " /* 索引" + i + " */");
                    }
                }
            } catch (e) {
                console.log("处理字符串数组时出错:", e);
            }
        }
        
        // 2. 处理索引转换函数
        var converterMatch = code.match(/(_0x[a-f0-9]+)\s*=\s*function\s*\((_0x[a-f0-9]+),\s*(_0x[a-f0-9]+)\)\s*\{\s*\1\s*=\s*\2\s*-\s*(0x[a-f0-9]+);?\s*return\s+_0x[a-f0-9]+\[\1\];?\s*\}/);
        if (converterMatch) {
            var converterName = converterMatch[1];
            var offset = converterMatch[4];
            
            console.log(`找到索引转换函数 ${converterName}，偏移量 ${offset}`);
            
            // 尝试替换函数调用
            var callPattern = new RegExp(converterName + '\\((0x[a-f0-9]+),\\s*_0x[a-f0-9]+\\)', 'g');
            code = code.replace(callPattern, function(match, hexIndex) {
                try {
                    var idx = parseInt(hexIndex, 16) - parseInt(offset, 16);
                    return `_0x46b1()[${idx}] /* ${hexIndex}->${idx} */`;
                } catch (e) {
                    return match;
                }
            });
        }
        
        return code;
    },
    
    // 处理常见模式
    processCommonPatterns: function(code) {
        // 1. 处理 gsMCfG 条件检查
        code = code.replace(/if\s*\(_0x[a-f0-9]+\[['"]gsMCfG['"]\]\s*===\s*undefined\)\s*\{([\s\S]+?)\}/g, 
            function(match, initBlock) {
                return "/* 初始化块 开始 */\n" + match + "\n/* 初始化块 结束 */";
            }
        );
        
        // 2. 处理自调用函数
        code = code.replace(/\(function\s*\((_0x[a-f0-9]+),\s*(_0x[a-f0-9]+),\s*(_0x[a-f0-9]+)(?:[\s\S]+?)\}\)\((0x[a-f0-9]+),\s*(0x[a-f0-9]+),\s*(_0x[a-f0-9]+)(?:[\s\S]+?)\)/g,
            function(match) {
                return "/* 主要加密逻辑自调用函数 开始 */\n" + match + "\n/* 主要加密逻辑自调用函数 结束 */";
            }
        );
        
        // 3. 处理字符串操作
        code = code.replace(/String\['fromCharCode'\]\(([^)]+)\)/g, function(match, args) {
            try {
                // 只处理简单情况
                if (/^\d+$/.test(args)) {
                    const result = String.fromCharCode(parseInt(args));
                    return `'${result}' /* fromCharCode(${args}) */`;
                }
            } catch (e) {}
            return match;
        });
        
        return code;
    },
    
    // 清理代码
    cleanCode: function(code) {
        // 移除多余的分号和空行
        code = code.replace(/;{2,}/g, ';');
        code = code.replace(/\n{3,}/g, '\n\n');
        
        return code;
    },
    
    // 添加解密辅助注释
    addHelperComments: function(code) {
        return `/* 
 * SOJSON v7 (jsjiami.com.v7) 解密处理版本
 * 此代码已被解密工具处理
 * 关键函数和数组已经标注
 */

${code}

/*
 * 此代码经过部分解密处理
 * SOJSON v7混淆特点:
 * 1. 使用_0x1fca等函数解码字符串
 * 2. 使用_0x46b1等函数生成字符串数组
 * 3. 使用\\x编码隐藏关键字符串
 * 4. 使用Base64/RC4组合加密部分数据
 */`;
    }
};

console.log("SOJSON v7解密插件(专家版)加载完成");