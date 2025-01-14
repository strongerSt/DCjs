    console.log('Decoding with params:', { p, a, c, k });
    e = function(c) {
        return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
    };
    if (!''.replace(/^/, String)) {
        d = {};  // 确保 d 是一个对象
        while (c--) {
            d[e(c)] = k[c] || e(c);
        }
        k = [function(e) {
            return d[e] || e;
        }];
        e = function() {
            return '\\w+';
        };
        c = 1;
    }
    while (c--) {
        if (k[c]) {
            console.log('Replacing:', k[c]);
            p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]);
        }
    }
    console.log('Decoded result:', p);
    return p;
}

function plugin(code) {
    try {
        let result = code;
        console.log('Processing code length:', code.length);
        
        // 处理多层eval
        let evalCount = 0;
        while (result.includes('eval(function(p,a,c,k,e,d)')) {
            evalCount++;
            console.log(`Processing eval layer ${evalCount}`);
            
            result = result.replace(/eval\(function\(p,a,c,k,e,d\)\{([\s\S]+?)\}\(([\s\S]+?)\)\)/, (match, body, args) => {
                try {
                    console.log('Found eval with args:', args);
                    // 解析参数
                    const params = args.split(',').map(arg => {
                        try {
                            return Function(`return ${arg}`)();
                        } catch (e) {
                            console.error('Param parse error:', e);
                            return arg;
                        }
                    });
                    
                    console.log('Parsed params:', params);
                    
                    // 使用解码函数
                    const decodedResult = decode(...params);
                    console.log('Decoded length:', decodedResult.length);
                    return decodedResult;
                } catch (e) {
                    console.error('Decode error:', e);
                    return match;
                }
            });
            
            if (evalCount > 10) {
                console.log('Too many eval layers, breaking...');
                break;
            }
        }
        
        // 如果是Part2AI代码，添加配置
        if (result.includes('Part2AI')) {
            console.log('Found Part2AI code, adding configuration');
            result = `
// Part2AI Configuration
const appVersion = "Part2AI Lite";
const productType = "app_store";
const productName = "Part2AI_Lite_Lifetime_Subscription";

${result}`;
        }
        
        console.log('Final result length:', result.length);
        return result;
        
    } catch (e) {
        console.error('Plugin error:', e);
        return code;
    }
}

module.exports = plugin;
