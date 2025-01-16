// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        function unpack(packedCode) {
            // 创建一个自定义的 eval 函数来捕获结果
            let unpacked = '';
            const fakeEval = function(code) {
                unpacked = code;
                return code;
            };
            
            // 替换原始代码中的 eval
            const modifiedCode = packedCode.replace(/eval\s*\(/, 'fakeEval(');
            
            // 在安全的上下文中执行
            const context = {
                fakeEval: fakeEval,
                String: String,
                RegExp: RegExp
            };
            
            try {
                with(context) {
                    eval(modifiedCode);
                }
                return unpacked;
            } catch(e) {
                console.log('解包错误:', e);
                return null;
            }
        }

        function recursiveUnpack(code, depth = 0) {
            if (depth > 10) return code; // 防止无限递归
            
            console.log(`进行第 ${depth + 1} 层解包...`);
            
            try {
                let result = unpack(code);
                if (result && result !== code) {
                    if (result.includes('eval(')) {
                        return recursiveUnpack(result, depth + 1);
                    }
                    return result;
                }
            } catch(e) {
                console.log(`第 ${depth + 1} 层解包失败:`, e);
            }
            
            return code;
        }

        // 开始解密
        const result = recursiveUnpack(code);
        
        if (result && result !== code) {
            // 尝试美化代码
            try {
                let ast = parse(result);
                return generator(ast, {
                    retainLines: true,
                    comments: true,
                    compact: false
                }).code;
            } catch(e) {
                return result;
            }
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
