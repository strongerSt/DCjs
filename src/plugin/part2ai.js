function plugin(code) {
    try {
        let result = code;
        
        // 处理多层eval
        while (result.includes('eval(function(p,a,c,k,e,d)')) {
            result = result.replace(/eval\((function\(p,a,c,k,e,d\)[\s\S]*?})\(([\s\S]*?)\)\)/, (match, func, args) => {
                try {
                    return eval('(' + func + ')(' + args + ')');
                } catch (e) {
                    console.error('Decode error:', e);
                    return match;
                }
            });
        }
        
        // 如果是Part2AI代码，添加配置
        if (result.includes('Part2AI')) {
            result = `
// Part2AI Configuration
const appVersion = "Part2AI Lite";
const productType = "app_store";
const productName = "Part2AI_Lite_Lifetime_Subscription";

${result}`;
        }
        
        return result;
    } catch (e) {
        console.error('Plugin error:', e);
        return code;
    }
}

module.exports = plugin;