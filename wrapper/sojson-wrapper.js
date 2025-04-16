/**
 * sojson-wrapper.js - 处理SOJSON混淆的JavaScript代码
 */
(function() {
    'use strict';
    
    // 全局注册对象
    window.DecodePlugins = window.DecodePlugins || {};
    
    // 检测函数 - 判断是否为SOJSON混淆代码
    function detect(code) {
        if (!code || typeof code !== 'string') return false;
        
        // SOJSON特征，通常包含_0x开头的变量和特定结构
        return code.includes('jsjiami.com.v6') || 
               (code.includes('_0x') && code.includes('var _0x') && 
                !code.includes('jsjiami.com.v7') && !code.includes('sojson.v7'));
    }
    
    // 解密函数
    function plugin(code) {
        try {
            // 如果不是SOJSON编码，返回原始代码
            if (!detect(code)) {
                return code;
            }
            
            // 记录日志
            if (typeof addLogEntry === 'function') {
                addLogEntry("开始处理SOJSON加密代码", "sojson");
            }
            
            // 去除特征标记
            code = code.replace(/\/\*\*[\s\S]*?jsjiami\.com\.v6[\s\S]*?\*\//g, "");
            code = code.replace(/\/\/[\s\S]*?jsjiami\.com\.v6.*$/gm, "");
            
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
                        addLogEntry(`替换了 ${array.length} 个字符串引用`, "sojson");
                    }
                } catch (e) {
                    // 忽略错误，继续处理
                    if (typeof addLogEntry === 'function') {
                        addLogEntry(`处理字符串数组时出错: ${e.message}`, "sojson");
                    }
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
            
            if (typeof addLogEntry === 'function') {
                addLogEntry("SOJSON代码处理完成", "sojson");
            }
            
            return code;
        } catch (e) {
            if (typeof addLogEntry === 'function') {
                addLogEntry(`SOJSON解密出错: ${e.message}`, "sojson");
            }
            console.error("SOJSON解密错误:", e);
            return code; // 出错时返回原始代码
        }
    }
    
    // 注册插件
    window.DecodePlugins.sojson = {
        detect: detect,
        plugin: plugin
    };
    
    console.log("SOJSON解密插件已加载");
})();
