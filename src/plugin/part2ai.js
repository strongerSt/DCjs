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
            
            // 替换更多潜在的问题模式
            let modifiedCode = packedCode
                .replace(/eval\s*\(/, 'fakeEval(')
                // 处理可能的全局变量访问
                .replace(/\bwindow\s*\./g, 'globalThis.')
                .replace(/\bdocument\s*\./g, 'globalThis.document.')
                // 替换一些可能导致问题的模式
                .replace(/\$\.notify/g, 'globalThis.$.notify');
            
            // 创建一个更完整的全局环境
            const globalEnv = {
                location: { href: 'https://example.com' },
                document: { 
                    cookie: '',
                    createElement: () => ({}),
                    getElementById: () => null,
                    querySelector: () => null
                },
                navigator: { 
                    userAgent: 'Mozilla/5.0 GitHub Actions',
                    language: 'en-US'
                },
                localStorage: {
                    getItem: () => null,
                    setItem: () => {}
                },
                sessionStorage: {
                    getItem: () => null,
                    setItem: () => {}
                },
                fetch: () => Promise.resolve({ json: () => Promise.resolve({}) }),
                XMLHttpRequest: function() {
                    return {
                        open: () => {},
                        send: () => {},
                        setRequestHeader: () => {}
                    };
                }
            };

            // 为 Node.js 环境创建一个模拟的浏览器全局对象
            globalThis.window = globalThis;
            Object.assign(globalThis, globalEnv);
            
            const context = {
    fakeEval: fakeEval,
    String: String,
    RegExp: RegExp,
    $response: { 
        data: "", 
        status: 200  // 移除多余的逗号
    },
    $: { notify: function() {} }
};
                // 添加所有可能在混淆代码中使用的变量
                $response: { 
                    data: packedCode,  // 将原始代码作为默认数据
                    status: 200,
                    headers: {}
                },
                $request: {
                    url: 'https://example.com',
                    headers: {}
                },
                $done: function(obj) { return obj; },
                $notify: function() { return null; },
                $task: { 
                    fetch: function() { return Promise.resolve({}); } 
                },
                window: globalThis.window,
                document: globalThis.document,
                navigator: globalThis.navigator,
                location: globalThis.location,
                localStorage: globalThis.localStorage,
                sessionStorage: globalThis.sessionStorage,
                setTimeout: setTimeout,
                clearTimeout: clearTimeout,
                setInterval: setInterval,
                clearInterval: clearInterval,
                console: console,
                Object: Object,
                Array: Array,
                Function: Function,
                JSON: JSON,
                Math: Math,
                Date: Date,
                parseInt: parseInt,
                parseFloat: parseFloat,
                isNaN: isNaN,
                isFinite: isFinite,
                encodeURI: encodeURI,
                decodeURI: decodeURI,
                encodeURIComponent: encodeURIComponent,
                decodeURIComponent: decodeURIComponent,
                btoa: function(str) { 
                    try { return Buffer.from(str).toString('base64'); } 
                    catch(e) { return ''; } 
                },
                atob: function(str) { 
                    try { return Buffer.from(str, 'base64').toString(); } 
                    catch(e) { return ''; } 
                },
                fetch: globalThis.fetch,
                XMLHttpRequest: globalThis.XMLHttpRequest,
                Promise: Promise,
                Error: Error,
                undefined: undefined,
                $: { 
                    notify: function() { return null; },
                    ajax: function() { return Promise.resolve({}); },
                    get: function() { return Promise.resolve({}); },
                    post: function() { return Promise.resolve({}); }
                },
                obj: {}, // 通用对象，常用于脚本配置
                body: "", // 常用于表示响应体
                data: {}  // 常用于存储数据
            };
            
            try {
                // 记录执行前的状态，用于调试
                console.log('准备执行解包...');
                
                // 在调用 eval 前打印部分代码，以便调试
                if (modifiedCode.length > 500) {
                    console.log('代码前500字符:', modifiedCode.substring(0, 500) + '...');
                } else {
                    console.log('完整代码:', modifiedCode);
                }
                
                with(context) {
                    eval(modifiedCode);
                }
                
                console.log('解包执行完成');
                
                if (!unpacked) {
                    console.log('警告: 解包后内容为空');
                    return null;
                }
                
                return unpacked;
            } catch(e) {
                // 提供更详细的错误信息
                console.log('解包错误类型:', e.constructor.name);
                console.log('解包错误消息:', e.message);
                console.log('解包错误堆栈:', e.stack);
                
                // 尝试定位错误位置
                try {
                    const errorMatch = e.stack.match(/eval at [^:]+:(\d+):(\d+)/);
                    if (errorMatch) {
                        const line = parseInt(errorMatch[1]);
                        const col = parseInt(errorMatch[2]);
                        console.log('错误可能发生在代码的第', line, '行，第', col, '列');
                        
                        // 输出错误附近的代码
                        const lines = modifiedCode.split('\n');
                        const start = Math.max(0, line - 3);
                        const end = Math.min(lines.length, line + 2);
                        console.log('错误上下文:');
                        for (let i = start; i < end; i++) {
                            console.log(`${i === line-1 ? '>' : ' '} ${i+1}: ${lines[i]}`);
                        }
                    }
                } catch(debugError) {
                    console.log('尝试定位错误位置时出错:', debugError);
                }
                
                return null;
            }
        }

        // 其余函数保持不变
        function formatCode(code) {
            try {
                const ast = parse(code, {
                    sourceType: "module",
                    plugins: ["jsx"]
                });

                // 只在最开始的变量声明添加注释
                let hasBaseConfig = false;

                traverse(ast, {
                    VariableDeclaration(path) {
                        const firstDecl = path.node.declarations[0];
                        if (firstDecl && ['names', 'productName', 'productType'].includes(firstDecl.id.name)) {
                            if (!hasBaseConfig) {
                                path.addComment('leading', ' 基础配置变量');
                                hasBaseConfig = true;
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
                            path.addComment('leading', ' 通知配置');
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

                // 手动处理格式，保持不变
                formatted = formatted
                    // 移除注释中的额外字符
                    .replace(/\/\* (.*?)\*\/\s*/g, '// $1\n')
                    // 处理重复的头部注释
                    .replace(/(\/\/.*?\n)+/g, '$1')
                    // 移除多余空行
                    .replace(/\n{3,}/g, '\n\n')
                    // 移除注释后的 //
                    .replace(/\/\/ .*?\/\//g, '//')
                    // 确保关键语句前有空行
                    .replace(/;(?=\s*(?:let|\/\/|obj\.|function))/g, ';\n')
                    // 处理订阅配置的格式
                    .replace(/\/\/ 订阅配置\s*obj\.subscriber =/, '// 订阅配置\nobj.subscriber =')
                    // 处理通知配置的格式
                    .replace(/\/\/ 通知配置\s*\$\.notify/, '// 通知配置\n$.notify')
                    // 适当添加空行
                    .replace(/(obj\.subscriber\.non_subscriptions\[.*?\];)/, '$1\n')
                    .replace(/(obj\.subscriber\.entitlements\[.*?\];)/, '$1\n')
                    // 移除行尾空白
                    .replace(/\s+$/gm, '')
                    // 移除空行开头的空白
                    .replace(/^\s+$/gm, '')
                    // 减少连续let声明之间的空行
                    .replace(/let.*?;\n\n(?=let)/g, '$&')
                    // 保持对象属性的缩进
                    .replace(/^(\s*[a-zA-Z_$][a-zA-Z0-9_$]*:)/gm, '  $1');

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
