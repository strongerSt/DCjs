// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        // ... 之前的解密逻辑 ...

        function formatCode(code) {
            const sections = [
                // 变量声明部分
                {
                    pattern: /let\s+[^;]+;/g,
                    label: '// 变量声明'
                },
                // 主要逻辑部分
                {
                    pattern: /obj\.subscriber\s*=[\s\S]+?\};/,
                    label: '// 主要订阅配置'
                },
                // 非订阅部分
                {
                    pattern: /obj\.subscriber\.non_subscriptions[\s\S]+?\];/,
                    label: '// 非订阅配置'
                },
                // 权限部分
                {
                    pattern: /obj\.subscriber\.entitlements[\s\S]+?\};/,
                    label: '// 权限配置'
                },
                // 通知部分
                {
                    pattern: /\$\.notify[\s\S]+?\);/,
                    label: '// 发送通知'
                },
                // Env函数
                {
                    pattern: /function\s+Env[\s\S]+?}/,
                    label: '// 环境配置函数'
                }
            ];

            let formattedCode = code;

            // 添加分节和注释
            sections.forEach(({pattern, label}) => {
                formattedCode = formattedCode.replace(pattern, match => `\n${label}\n${match}\n`);
            });

            // 美化代码结构
            try {
                const ast = parse(formattedCode, {
                    sourceType: 'module'
                });
                
                formattedCode = generator(ast, {
                    retainLines: false,
                    compact: false,
                    comments: true,
                    indent: {
                        style: '    ',
                        adjustMultilineComment: true
                    }
                }).code;
            } catch(e) {
                console.log('格式化出错:', e);
            }

            return formattedCode;
        }

        // 在解密后添加格式化
        if (result && result !== code) {
            return formatCode(result);
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
