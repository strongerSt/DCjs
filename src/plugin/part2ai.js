function decoder(p, a, c, k, e, d) {
    const lookup = {};
    while (c--) {
        if (k[c]) {
            const pattern = new RegExp('\\b' + c.toString(a) + '\\b', 'g');
            p = p.replace(pattern, k[c]);
        }
    }
    return p;
}

function plugin(code) {
    function decodeEval(encoded) {
        try {
            // 修复正则表达式
            const evalPattern = /eval\(function\s*\(p,a,c,k,e,d\)\s*\{[\s\S]*?\}\s*\(([\s\S]*?)\)\)/;
            const match = encoded.match(evalPattern);
            
            if (!match) return encoded;
            
            const params = match[1].split(',').map(param => {
                try {
                    return Function('return ' + param)();
                } catch (e) {
                    return param;
                }
            });
            
            // 应用解码
            return decoder(...params);
            
        } catch (e) {
            console.error('Decode error:', e);
            return encoded;
        }
    }
    
    try {
        let result = code;
        let prevResult;
        let count = 0;
        const MAX_ITERATIONS = 5;
        
        // 循环解码
        do {
            prevResult = result;
            result = decodeEval(result);
            count++;
            console.log(`Iteration ${count}, length: ${result.length}`);
        } while (result !== prevResult && count < MAX_ITERATIONS);
        
        // 清理结果
        result = result
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
        
        // 添加配置
        if (result.includes('Part2AI') || result.includes('RCAnonymousID')) {
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
