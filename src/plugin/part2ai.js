function decode(p, a, c, k, e, d) {
    d = {};
    while (c--) {
        if (k[c]) {
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        }
    }
    return p;
}

function unpack(str) {
    var p = str;
    var a = parseInt(arguments[1] || "32");
    var c = arguments[2] || "0";
    var k = arguments[3] || "{}";
    var e = function(c) {
        return ((c < a ? "" : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36)));
    };
    
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
                    let params = args.split(',').map(param => {
                        try {
                            return Function('return ' + param)();
                        } catch(e) {
                            return param;
                        }
                    });
                    return unpack.apply(null, params);
                } catch(e) {
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
    } catch(e) {
        console.error('Plugin error:', e);
        return code;
    }
}

module.exports = plugin;
