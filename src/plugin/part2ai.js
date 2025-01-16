// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        function unpackEval(code) {
            // 由于代码可能包含特殊字符，我们先将它封装在函数中
            let sandbox = {
                result: null,
                eval: function(code) {
                    this.result = code;
                    return code;
                }
            };

            try {
                with(sandbox) {
                    eval(code);
                }
                return sandbox.result;
            } catch (e) {
                console.log('解包错误:', e);
                return null;
            }
        }

        function processCode(code) {
            // 处理可能的转义符号
            code = code.replace(/\\x([0-9A-Fa-f]{2})/g, function(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            });
            
            // 处理 Unicode 转义
            code = code.replace(/\\u([0-9A-Fa-f]{4})/g, function(match, p1) {
                return String.fromCharCode(parseInt(p1, 16));
            });

            return code;
        }

        // 递归解密
        function recursiveUnpack(code, depth = 0) {
            if (depth > 5) return code; // 防止无限递归
            
            console.log(`正在进行第 ${depth + 1} 层解密...`);
            
            let processed = processCode(code);
            let unpacked = unpackEval(processed);
            
            if (unpacked && unpacked !== code) {
                if (unpacked.includes('eval(')) {
                    return recursiveUnpack(unpacked, depth + 1);
                }
                return unpacked;
            }
            
            return code;
        }

        // 主解密流程
        let result = recursiveUnpack(code);
        
        // 如果解密成功，尝试美化代码
        if (result && result !== code) {
            try {
                let ast = parse(result, {
                    sourceType: 'module',
                    plugins: ['jsx']
                });
                
                result = generator(ast, {
                    retainLines: true,
                    comments: true,
                    compact: false
                }).code;
                
                console.log('解密成功');
                return result;
            } catch (e) {
                console.log('格式化失败:', e);
                return result;
            }
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
