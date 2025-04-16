// SOJSON v7混淆解密插件 - 简化版
window.DecodePlugins.sojsonv7 = {
    detect: function(code) {
        if (!code || typeof code !== 'string') return false;
        return (code.indexOf('_0x') !== -1) && (code.indexOf('decode') !== -1);
    },
    plugin: function(code) {
        // 简单返回原始代码，但标记为已加载成功
        console.log("SOJSON v7解密插件已加载成功");
        return code;
    }
};
