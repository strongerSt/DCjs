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

                // 添加代码块注释
                traverse(ast, {
                    VariableDeclaration(path) {
                        const firstDecl = path.node.declarations[0];
                        if (firstDecl && !path.node.leadingComments) {
                            if (['names', 'productName', 'productType'].includes(firstDecl.id.name)) {
                                path.addComment('leading', ' 基础配置');
                            }
                        }
                    },
                    AssignmentExpression(path) {
                        const left = path.node.left;
                        if (left.object?.name === 'obj') {
                            if (left.property?.name === 'subscriber' && !path.node.leadingComments) {
                                path.addComment('leading', ' 订阅配置');
                            } else if (left.property?.name === 'entitlements' && !path.node.leadingComments) {
                                path.addComment('leading', ' 权限配置');
                            }
                        }
                    },
                    CallExpression(path) {
                        const callee = path.node.callee;
                        if (callee.property?.name === 'notify' && !path.node.leadingComments) {
                            path.addComment('leading', ' 通知配置');
                        }
                    },
                    FunctionDeclaration(path) {
                        if (path.node.id.name === 'Env' && !path.node.leadingComments) {
                            path.addComment('leading', '\n 环境配置函数');
                        }
                    }
                });

                return generator(ast, {
                    retainLines: false,
                    comments: true,
                    compact: false,
                    indent: {
                        style: '    '
                    }
                }).code;
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
