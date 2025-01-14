function decoder(p, a, c, k, e, d) {
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    d = {};
    
    while (c--) {
        if (k[c]) {
            d[e(c)] = k[c];
        }
    }
    
    return p.replace(/\b\w+\b/g, function(w) {
        return d.hasOwnProperty(w) ? d[w] : w;
    });
}

function plugin(code) {
    try {
        let result = code;
        
        // 提取每一层的参数
        const evalRegex = /'([^']+)'/g;
        let match;
        
        // 收集所有匹配的字符串
        let matches = [];
        while ((match = evalRegex.exec(result)) !== null) {
            matches.push(match[1]);
        }
        
        // 尝试解码最后一个匹配（通常是最内层的编码）
        if (matches.length > 0) {
            const lastMatch = matches[matches.length - 1];
            
            // 分割参数
            const parts = lastMatch.split('|');
            if (parts.length > 0) {
                let words = parts;
                let str = matches[0];
                let base = 36; // 默认基数
                let count = words.length;
                
                result = decoder(str, base, count, words);
            }
        }
        
        // 添加 Part2AI 配置
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
