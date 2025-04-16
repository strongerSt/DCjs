// Common通用解密插件 - 作为最后的备选方案
console.log("Common解密插件加载中...");

if(!window.DecodePlugins) {
    window.DecodePlugins = {};
}

window.DecodePlugins.common = {
    detect: function(code) {
        // 通用插件总是返回true，因为它是最后的备选方案
        return true;
    },
    
    plugin: function(code) {
        try {
            console.log("开始通用代码处理");
            
            // 如果代码长度太短，直接返回
            if (!code || code.length < 50) {
                return code;
            }
            
            // 1. 处理基本编码和转义
            code = this.decodeBasicEncodings(code);
            
            // 2. 移除死代码和无用注释
            code = this.removeDeadCode(code);
            
            // 3. 尝试简化常见的混淆模式
            code = this.simplifyCommonPatterns(code);
            
            console.log("通用代码处理完成");
            return code;
        } catch (e) {
            console.error("通用解密错误:", e);
            return code; // 出错时返回原始代码
        }
    },
    
    // 解码基本编码和转义序列
    decodeBasicEncodings: function(code) {
        var result = code;
        
        // 解码十六进制字符串
        result = result.replace(/\\x([0-9A-Fa-f]{2})/g, function(match, p1) {
            try {
                return String.fromCharCode(parseInt(p1, 16));
            } catch (e) {
                return match;
            }
        });
        
        // 解码Unicode转义序列
        result = result.replace(/\\u([0-9a-fA-F]{4})/g, function(match, grp) {
            try {
                return String.fromCharCode(parseInt(grp, 16));
            } catch (e) {
                return match;
            }
        });
        
        // 处理八进制转义
        result = result.replace(/\\([0-7]{1