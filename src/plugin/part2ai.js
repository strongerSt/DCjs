function decode(p, a, c, k, e, d) {
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    if (!''.replace(/^/, String)) {
        while (c--) {
            d[e(c)] = k[c] || e(c);
        }
        k = [function(e) {
            return d[e];
        }];
        e = function() {
            return '\\w+';
        };
        c = 1;
    }
    while (c--) {
        if (k[c]) {
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        }
    }
    return p;
}

function plugin(code) {
    try {
        let result = code;
        
        // 处理多层eval
        while (result.includes('eval(function(p,a,c,k,e,d)')) {
            result = result.replace(/eval\(function\(p,a,c,k,e,d\)\{([\s\S]+?)\}\(([\s\S]+?)\)\)/, (match, body, args) => {
                try {
                    // 解析参数
                    const params = args.split(',').map(arg => {
                        try {
                            return eval('(' + arg + ')');
                        } catch (e) {
                            return arg;
                        }
                    });
                    
                    // 使用解码函数
                    return decode.apply(null, params);
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
