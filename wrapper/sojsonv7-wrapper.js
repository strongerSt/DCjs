/**
 * sojsonv7-wrapper.js - 处理SOJSON v7混淆的JavaScript代码
 */
(function() {
    'use strict';
    
    // 全局注册对象
    window.DecodePlugins = window.DecodePlugins || {};
    
    // 检测函数 - 判断是否为SOJSON v7混淆代码
    function detect(code) {
        if (!code || typeof code !== 'string') return false;
        
        // SOJSON v7特征
        return code.includes('jsjiami.com.v7') || 
               code.includes('sojson.v7') || 
               (code.includes('_0x') && code.includes('fromCharCode') && 
                code.includes('decode'));
    }
    
    // 解密函数
    function plugin(code) {
        try {
            // 如果不是SOJSON v7编码，返回原始代码
            if (!detect(code)) {
                return code;
            }
            
            // 记录日志
            if (typeof addLogEntry === 'function') {
                addLogEntry("开始处理SOJSON v7加密代码", "sojsonv7");
            }
            
            // 去除特征标记
            code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v7[\s\S]*?\*\//g, "");
            code = code.replace(/\/\*\*[\s\S]*?sojson\.v7[\s\S]*?\*\//g, "");
            code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v7.*$/gm, "");
            code = code.replace(/\/\/[\s\S]*?sojson\.v7.*$/gm, "");
            
            // 查找字符串数组并替换
            var arrayRegex = /var\s+(_0x[a-f0-9]{4,})\s*=\s*\[\s*([^\]]*)\s*\]/g;
            var match;
            
            while ((match = arrayRegex.exec(code)) !== null) {
                try {
                    var arrayName = match[1];
                    var arrayContent = match[2];
                    var arrayStr = "[" + arrayContent + "]";
                    var array = new Function("return " + arrayStr)();
                    
                    // 替换简单引用
                    for (var i = 0; i < array.length; i++) {
                        var pattern = new RegExp(arrayName + "\\[" + i + "\\]", "g");
                        if (typeof array[i] === 'string') {
                            code = code.replace(pattern, "'" + array[i].replace(/'/g, "\\'") + "'");
                        }
                    }
                    
                    if (typeof addLogEntry === 'function') {
                        addLogEntry(`替换了 ${array.length} 个字符串引用`, "sojsonv7");
                    }
                } catch (e) {
                    // 忽略错误，继续处理
                    if (typeof addLogEntry === 'function') {
                        addLogEntry(`处理字符串数组时出错: ${e.message}`, "sojsonv7");
                    }
                }
            }
            
            // 尝试解码Unicode转义序列
            code = code.replace(/\\u([0-9a-fA-F]{4})/g, function(match, grp) {
                return String.fromCharCode(parseInt(grp, 16));
            });
            
            // 尝试处理常见的编码函数调用
            var decodeFuncRegex = /function\s+(_0x[a-f0-9]+)\s*\(.*?\)\s*\{\s*(?:var\s+_0x[a-f0-9]+=.*?;)?\s*return\s+(.*?)\s*;\s*\}/g;
            while ((match = decodeFuncRegex.exec(code)) !== null) {
                try {
                    var funcName = match[1];
                    var funcPattern = new RegExp(funcName + '\\(([^)]+)\\)', 'g');
                    
                    // 标记此函数已被识别
                    if (typeof addLogEntry === 'function') {
                        addLogEntry(`识别到解码函数: ${funcName}`, "sojsonv7");
                    }
                } catch (e) {
                    // 忽略错误
                }
            }
            
            if (typeof addLogEntry === 'function') {
                addLogEntry("SOJSON v7代码处理完成", "sojsonv7");
            }
            
            return code;
        } catch (e) {
            if (typeof addLogEntry === 'function') {
                addLogEntry(`SOJSON v7解密出错: ${e.message}`, "sojsonv7");
            }
            console.error("SOJSON v7解密错误:", e);
            return code; // 出错时返回原始代码
        }
    }
    
    // 注册插件
    window.DecodePlugins.sojsonv7 = {
        detect: detect,
        plugin: plugin
    };
    
    console.log("SOJSON v7解密插件已加载");
})();
