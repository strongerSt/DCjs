
// src/plugins/part2ai.js
const { parse } = require('@babel/parser')
const generator = require('@babel/generator').default
const traverse = require('@babel/traverse').default
const t = require('@babel/types')

module.exports = function(code) {
    try {
        function unpack(packedCode) {
            let unpacked = '';
            const fakeEval = function(code) {
                unpacked = code;
                return code;
            };
            
            const modifiedCode = packedCode.replace(/eval\s*\(/, 'fakeEval(');
            
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

        function formatCode(code) {
            try {
                const ast = parse(code, {
                    sourceType: "module",
                    plugins: ["jsx"]
                });

                // 添加一个变量来跟踪基础配置注释
                let hasBaseConfig = false;

                traverse(ast, {
                    VariableDeclaration(path) {
                        const firstDecl = path.node.declarations[0];
                        if (firstDecl && ['names', 'productName', 'productType'].includes(firstDecl.id.name)) {
                            // 只在第一次添加基础配置注释
                            if (!hasBaseConfig) {
                                path.addComment('leading', ' 基础配置变量');
                                hasBaseConfig = true;
                            }
                        }
                    },
                    AssignmentExpression(path) {
                        const left = path.node.left;
                        if (left.object?.name === 'obj') {
                            if (left.property?.name === 'subscriber') {
                                path.addComment('leading', ' 订阅配置对象');
                            }
                        }
                    },
                    CallExpression(path) {
                        const callee = path.node.callee;
                        if (callee.property?.name === 'notify') {
                            path.addComment('leading', ' 发送成功通知');
                        }
                    }
                });

                let formatted = generator(ast, {
                    retainLines: false,
                    comments: true,
                    compact: false,
                    indent: {
                        style: '  '
                    }
                }).code;

                // 手动处理格式
                formatted = formatted
                    // 处理注释格式
                    .replace(/\/\*|\*\//g, '//')
                    // 移除多余空行
                    .replace(/\n{3,}/g, '\n\n')
                    // 确保在主要块之间有一个空行
                    .replace(/;(?=\s*(?:let|\/\/|obj\.|function))/g, ';\n')
                    // 整理订阅配置对象的格式
                    .replace(/\/\/ 订阅配置对象\s*obj\.subscriber =/, '// 订阅配置对象\nobj.subscriber =')
                    // 整理通知配置的格式
                    .replace(/\/\/ 发送成功通知\s*\$\.notify/, '// 发送成功通知\n$.notify')
                    // 在函数定义前后添加空行
                    .replace(/\$done\(\{/, '\n$done({')
                    // 添加额外的换行来分隔主要代码块
                    .replace(/(obj\.subscriber\.non_subscriptions\[.*?\];)/, '$1\n')
                    .replace(/(obj\.subscriber\.entitlements\[.*?\];)/, '$1\n');

                // 添加文件头注释
                const header = `//Generated at ${new Date().toISOString()}\n` +
                             `//Base:https://github.com/echo094/decode-js\n` +
                             `//Modify:https://github.com/smallfawn/decode_action\n\n`;

                return header + formatted;

            } catch(e) {
                console.log('格式化错误:', e);
                return code;
            }
        }

        function recursiveUnpack(code, depth = 0) {
            if (depth > 10) return code;
            
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

        // 解密并格式化
        const decrypted = recursiveUnpack(code);
        
        if (decrypted && decrypted !== code) {
            // 解密成功后进行格式化
            return formatCode(decrypted);
        }

        return code;
    } catch (error) {
        console.error('part2ai 处理失败:', error);
        return code;
    }
}
