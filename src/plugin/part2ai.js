function plugin(code) {
    function decode(p, a, c, k, e, d) {
        e = function(c) {
            return (c < a ? '' : e(parseInt(c / a))) + ((c = c % a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
        };
        d = {};
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

    try {
        let result = code;
        let lastResult = '';
        let iterations = 0;
        const maxIterations = 10;

        // 持续解码直到无法再解码或达到最大迭代次数
        while (result !== lastResult && iterations < maxIterations) {
            lastResult = result;
            iterations++;

            // 处理eval包装的代码
            result = result.replace(/eval\(function\s*\(p,a,c,k,e,d\)[\s\S]*?}\(([\s\S]+?)\)\)/g, 
                function(match, args) {
                    try {
                        // 分割并解析参数
                        const params = args.split(',').map(arg => {
                            try {
                                return eval('(' + arg + ')');
                            } catch (e) {
                                return arg;
                            }
                        });

                        // 应用解码函数
                        return decode(...params);
                    } catch (e) {
                        console.error('Decode error:', e);
                        return match;
                    }
                }
            );

            // 尝试解码字符串数组形式的混淆
            if (result.match(/^['"][\s\S]+['"]$/)) {
                try {
                    const evalResult = eval('(' + result + ')');
                    if (typeof evalResult === 'string' && evalResult !== result) {
                        result = evalResult;
                    }
                } catch (e) {
                    console.error('String eval error:', e);
                }
            }
        }

        // 如果是Part2AI相关代码，添加配置
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
