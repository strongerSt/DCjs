// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        // 解析混淆的函数参数
        function parseFunction(code) {
            const matches = code.match(/eval\(function\(p,a,c,k,e,d\).*?{([\s\S]+?)}\((.*?)\)\)/);
            if (!matches) return null;
            
            const [_, functionBody, args] = matches;
            let [p, a, c, k, e, d] = eval(`[${args}]`);  // 解析参数

            // 还原原始代码
            e = function(c) {
                return (c < a ? '' : e(parseInt(c/a))) + ((c = c%a) > 35 ? String.fromCharCode(c + 29) : c.toString(36));
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

        function unpackAll(code) {
            let result = code;
            let lastResult;
            
            // 持续解密直到没有更多的 eval
            do {
                lastResult = result;
                try {
                    result = parseFunction(result) || result;
                } catch (e) {
                    console.log('解密层级出错:', e);
                    break;
                }
            } while (result !== lastResult && result.includes('eval(function(p,a,c,k,e,d)'));

            return result;
        }

        // 开始解密
        const decrypted = unpackAll(code);
        
        if (decrypted !== code) {
            return decrypted;
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
