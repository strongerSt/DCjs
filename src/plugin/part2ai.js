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
                        if (firstDecl) {
                            if (['names', 'productName', 'productType'].includes(firstDecl.id.name)) {
                                // 只给主要配置项添加注释
                                if (!path.node.leadingComments) {
                                    path.addComment('leading', ' 基础配置');
                                }
                            }
                        }
                    },
                    AssignmentExpression(path) {
                        if (path.node.left.object?.name === 'obj') {
                            if (path.node.left.property?.name === 'subscriber') {
                                path.addComment('leading', ' 订阅配置');
                            }
                        }
                    },
                    CallExpression(path) {
                        if (path.node.callee.property?.name === 'notify') {
                            // 确保通知配置单独一行
                            path.addComment('leading', ' 通知配置');
                        }
                    }
                });

                // 自定义格式化配置
                return generator(ast, {
                    retainLines: false,
                    comments: true,
                    compact: false,
                    indent: {
                        style: '  '  // 使用两个空格缩进
                    },
                    auxiliaryCommentBefore: '',
                    jsonCompatibleStrings: true,
                    decoratorsBeforeExport: true
                }).code.replace(/;\n+/g, ';\n') // 移除多余的空行
                   .replace(/\/\* (.*?)\*\/\n/g, '\n// $1\n') // 改变注释风格
                   .replace(/\n{3,}/g, '\n\n') // 限制最大连续空行数为2
                   .replace(/(\/\/ .*?)\n\n/g, '$1\n'); // 移除注释后的额外空行
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
