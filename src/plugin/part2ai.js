// src/plugin/part2ai.js
const escodegen = require('escodegen');
const esprima = require('esprima');

function unpack(code) {
    return code.replace(/eval\(function\s*\(p,a,c,k,e,d\)[\s\S]*?}\(([\s\S]+?)\)\)/, function(match, p) {
        try {
            let params = p.split(',').map(param => {
                try {
                    return eval('(' + param + ')');
                } catch(e) {
                    return param;
                }
            });
            
            let [str, base, count, names, ...rest] = params;
            let dict = {};
            
            // 构建字典
            while(count--) {
                let key = encode(count, base);
                dict[key] = names[count] || key;
            }
            
            // 替换所有编码过的字符串
            return str.replace(/\b\w+\b/g, match => dict[match] || match);
        } catch(e) {
            console.error('Unpacking error:', e);
            return match;
        }
    });
}

function encode(num, base) {
    if(num < base) {
        return num < 36 ? num.toString(36) : String.fromCharCode(num + 29);
    }
    num = parseInt(num / base);
    return encode(num, base) + (num % base < 36 ? (num % base).toString(36) : String.fromCharCode((num % base) + 29));
}

function plugin(code) {
    try {
        let result = code;
        
        // 处理多层eval
        while(result.includes('eval(function(p,a,c,k,e,d)')) {
            let newResult = unpack(result);
            if(newResult === result) {
                break;
            }
            result = newResult;
        }
        
        // 如果是Part2AI代码，添加配置
        if(result.includes('Part2AI')) {
            result = `
// Part2AI Configuration
const appVersion = "Part2AI Lite";
const productType = "app_store";
const productName = "Part2AI_Lite_Lifetime_Subscription";

${result}`;
            
            // 尝试美化代码
            try {
                const ast = esprima.parse(result);
                result = escodegen.generate(ast, {
                    format: {
                        indent: {
                            style: '    ',
                            base: 0
                        },
                        newline: '\n'
                    },
                    comment: true
                });
            } catch(e) {
                console.error('Beautification failed:', e);
            }
        }
        
        return result;
    } catch(e) {
        console.error('Plugin error:', e);
        return code;
    }
}

module.exports = plugin;
