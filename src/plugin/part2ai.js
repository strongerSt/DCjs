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
        const pattern = /eval\(function\(p,a,c,k,e,d\)\{[\s\S]*?return p\}(?:\(|\.)([^)]*)\))/;
        const matches = encoded.match(pattern);
        
        if (!matches) return encoded;
        
        try {
            const args = matches[1].split(',').map(arg => {
                try {
                    return Function('return ' + arg)();
                } catch (e) {
                    return arg;
                }
            });
            
            return decoder(...args);
        } catch (e) {
            console.error('Decode error:', e);
            return encoded;
        }
    }
    
    try {
        let result = code;
        let prevResult;
        let count = 0;
        const MAX_ITERATIONS = 10;
        
        // 循环解码直到无法继续或达到最大次数
        do {
            prevResult = result;
            result = decodeEval(result);
            count++;
        } while (result !== prevResult && count < MAX_ITERATIONS);
        
        // 清理结果
        result = result
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
        
        // 如果包含Part2AI相关内容，添加配置
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
