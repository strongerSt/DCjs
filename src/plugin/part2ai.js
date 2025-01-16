// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')
const vm = require('vm')

module.exports = function(code) {
    try {
        // 创建模拟环境
        const context = vm.createContext({
            console: console,
            $response: { body: '{}' },
            $persistentStore: {
                read: () => '',
                write: () => true
            },
            $notification: {
                post: () => {}
            },
            $httpClient: {
                get: () => {},
                post: () => {},
                put: () => {}
            },
            $prefs: {
                valueForKey: () => null,
                setValueForKey: () => null
            },
            $task: {
                fetch: () => Promise.resolve({body: '{}'})
            },
            $done: () => {},
            JSON: JSON
        });

        function decompress(code) {
            try {
                // 尝试解析和美化代码
                const ast = parse(code)
                let result = generator(ast, {
                    retainLines: true,
                    compact: false,
                    comments: true
                }).code

                return result
            } catch(e) {
                console.log('格式化错误:', e)
                return code
            }
        }

        // 返回格式化后的代码
        return decompress(code)

    } catch (error) {
        console.error('part2ai 处理失败:', error)
        return code
    }
}
