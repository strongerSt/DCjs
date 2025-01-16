// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const vm = require('vm')

module.exports = function(code) {
    try {
        // 创建安全的执行环境
        const context = vm.createContext({
            console: console
        });

        // EvalDecode 函数
        function EvalDecode(source) {
            try {
                return vm.runInContext(source, context);
            } catch (e) {
                console.log('EvalDecode 错误:', e);
                return null;
            }
        }

        // 解密函数
        function unpack(code) {
            try {
                let ast = parse(code, { errorRecovery: true })
                let lines = ast.program.body
                let data = null
                
                for (let line of lines) {
                    if (t.isEmptyStatement(line)) continue;
                    
                    // 检查是否是 eval 调用
                    if (t.isCallExpression(line?.expression) && 
                        line.expression.callee?.name === 'eval') {
                        
                        // 获取 eval 的参数
                        let evalArg = generator(line.expression.arguments[0], { minified: true }).code;
                        
                        // 尝试在安全环境中执行
                        try {
                            let result = vm.runInContext(evalArg, context);
                            if (result) return result;
                        } catch (e) {
                            console.log('执行 eval 参数错误:', e);
                        }
                    }
                }
                return null;
            } catch (e) {
                console.log('unpack 错误:', e);
                return null;
            }
        }

        // 尝试不同的解密方法
        let result = EvalDecode(code) || unpack(code);
        
        if (result) {
            console.log('解密结果类型:', typeof result);
            console.log('解密结果预览:', typeof result === 'string' ? result.slice(0, 100) : result);
            return result;
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
