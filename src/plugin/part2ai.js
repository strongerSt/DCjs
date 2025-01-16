// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        function unpackEval(code) {
            try {
                // 使用正则提取函数参数
                let match = code.match(/eval\(function\(p,a,c,k,e,d\)(.*?})\((.*?)\)\)/);
                if (!match) return null;

                // 提取函数体和参数
                let [fullMatch, funcBody, params] = match;
                
                // 构建新的函数调用
                let newFuncBody = `(function(p,a,c,k,e,d)${funcBody})(${params})`;
                
                // 执行函数
                try {
                    let result = eval(newFuncBody);
                    if (result && typeof result === 'string') {
                        return result;
                    }
                } catch (evalError) {
                    console.log('Eval执行错误:', evalError);
                }
                return null;
            } catch (e) {
                console.log('解包错误:', e);
                return null;
            }
        }

        function recursiveUnpack(code) {
            let result = code;
            let rounds = 0;
            const MAX_ROUNDS = 10; // 防止无限循环

            while (rounds < MAX_ROUNDS && result.includes('eval(function(p,a,c,k,e,d)')) {
                let lastResult = result;
                let unpacked = unpackEval(result);
                
                if (!unpacked) {
                    console.log(`第 ${rounds + 1} 轮解密失败`);
                    break;
                }
                
                result = unpacked;
                if (result === lastResult) {
                    break;
                }
                
                rounds++;
                console.log(`完成第 ${rounds} 轮解密`);
            }

            return result;
        }

        // 开始解密
        console.log('开始解密...');
        const decrypted = recursiveUnpack(code);
        
        if (decrypted && decrypted !== code) {
            console.log('解密成功');
            return decrypted;
        } else {
            console.log('未能成功解密');
            return code;
        }

    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
