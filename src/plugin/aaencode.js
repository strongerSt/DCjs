/**
 * AAencode (颜文字JavaScript) 解密插件
 * 使用vm2库提供安全的代码执行环境，避免CSP限制
 */
const { VM, NodeVM } = require('vm2');

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }

    try {
        // 创建一个nodejs环境的VM，这样可以绕过一些CSP限制
        const nodeVM = new NodeVM({
            console: 'inherit',
            sandbox: {}, // 空沙箱
            require: {
                external: false, // 不允许外部require
                builtin: ['util'], // 只允许内置模块util
                root: "./", // 根目录
                mock: {
                    // 模拟一些可能需要用到的模块
                    fs: {
                        readFileSync: () => ''
                    }
                }
            },
            wrapper: 'none', // 不使用包装器
        });
        
        // 准备可能在代码中用到的环境变量和对象
        const setupCode = `
            // 基本环境变量
            var window = {};
            var document = { createElement: () => ({}) };
            var navigator = { userAgent: '' };
            var location = { href: '' };
            
            // 可能需要的变量
            var $response = {};
            var $data = {};
            var $result = {};
            var $request = {};
            var $input = {};
            var $output = {};
            var $token = '';
            var $key = '';
            var $value = '';
            
            // 禁用动态代码生成功能，用无害的替代品
            var originalEval = eval;
            eval = function(code) { 
                console.log('尝试使用eval，被安全拦截'); 
                return code; 
            };
            
            // 执行AAencode代码
            ${code}
            
            // 尝试获取结果
            var result = '';
            if (typeof ﾟoﾟ !== 'undefined') {
                result = ﾟoﾟ;
            }
            
            // 导出结果
            module.exports = { 
                result: result,
                globals: Object.keys(this).filter(k => 
                    typeof this[k] === 'string' || 
                    (this[k] && typeof this[k] === 'object')
                ).reduce((acc, k) => {
                    acc[k] = this[k];
                    return acc;
                }, {})
            };
        `;

        // 创建一个临时文件来执行脚本
        const tempScriptFile = './temp-aaencode-script.js';
        const fs = require('fs');
        fs.writeFileSync(tempScriptFile, setupCode);

        try {
            // 在nodeVM中运行脚本文件
            const runResult = nodeVM.run(fs.readFileSync(tempScriptFile), tempScriptFile);
            
            // 清理临时文件
            fs.unlinkSync(tempScriptFile);
            
            // 处理结果
            if (runResult && runResult.result) {
                if (typeof runResult.result === 'string') {
                    return runResult.result;
                } else {
                    try {
                        return JSON.stringify(runResult.result, null, 2);
                    } catch (e) {
                        return String(runResult.result);
                    }
                }
            }
            
            // 如果没有直接结果，尝试从globals中找
            if (runResult && runResult.globals) {
                for (const key in runResult.globals) {
                    if (key.includes('ﾟ') || key.includes('_')) {
                        const value = runResult.globals[key];
                        if (typeof value === 'string' && value.length > 5) {
                            return value;
                        }
                    }
                }
            }
        } catch (e) {
            console.error("NodeVM执行失败:", e.message);
            // 清理临时文件
            if (fs.existsSync(tempScriptFile)) {
                fs.unlinkSync(tempScriptFile);
            }
        }
        
        // 如果VM执行失败，尝试静态提取方法
        // 提取所有可能的JavaScript代码片段
        console.log("尝试静态提取AAencode代码内容...");
        
        // 提取可能的字符串字面量
        const stringLiterals = [];
        code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
            if (content.length > 5) stringLiterals.push(content);
            return match;
        });
        
        if (stringLiterals.length > 0) {
            // 返回最长的字符串作为可能的结果
            const longestString = stringLiterals.sort((a, b) => b.length - a.length)[0];
            return "// AAencode静态提取的字符串:\n" + longestString;
        }
        
        // 如果仍然没有找到有用的内容，使用一种更简单的方法
        // 替换颜文字为简单的变量名，使代码更可读
        let simplifiedCode = code
            .replace(/ﾟωﾟﾉ/g, 'var1')
            .replace(/ﾟｰﾟ/g, 'var2')
            .replace(/ﾟΘﾟ/g, 'var3')
            .replace(/ﾟДﾟ/g, 'var4')
            .replace(/ﾟoﾟ/g, 'result');
        
        return "// AAencode解码失败，返回简化代码:\n" + simplifiedCode;
        
    } catch (e) {
        console.error("AAencode解密主过程失败:", e.message);
        return "// AAencode解密错误: " + e.message + "\n" + code;
    }
}

module.exports = decodeAAencode;