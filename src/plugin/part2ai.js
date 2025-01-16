

const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

// 插件直接作为函数导出
module.exports = function(code) {
    try {
        // EvalDecode 函数
        function EvalDecode(source) {
            self._eval = self.eval;
            self.eval = (_code) => {
                self.eval = self._eval;
                return _code;
            };
            return self._eval(source);
        }

        // 解密函数
        function unpack(code) {
            let ast = parse(code, { errorRecovery: true })
            let lines = ast.program.body
            let data = null
            for (let line of lines) {
                if (t.isEmptyStatement(line)) {
                    continue
                }
                if (data) {
                    return null
                }
                if (
                    t.isCallExpression(line?.expression) &&
                    line.expression.callee?.name === 'eval' &&
                    line.expression.arguments.length === 1 &&
                    t.isCallExpression(line.expression.arguments[0])
                ) {
                    data = t.expressionStatement(line.expression.arguments[0])
                    continue
                }
                return null
            }
            if (!data) {
                return null
            }
            code = generator(data, { minified: true }).code
            return eval(code)
        }

        // 尝试解密
        const evalDecoded = EvalDecode(code)
        const unpackDecoded = unpack(code)
        let result = evalDecoded || unpackDecoded

        if (result) {
            return result
        }
        return code // 如果解密失败，返回原始代码
    } catch (error) {
        console.error('part2ai 处理失败:', error)
        return code // 出错时返回原始代码
    }
}
