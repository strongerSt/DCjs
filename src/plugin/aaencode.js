/**
 * AAencode (颜文字JavaScript) 解密插件
 * 使用vm2库提供安全的代码执行环境
 */
const { VM, VMScript } = require('vm2');

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }

    try {
        // 创建一个安全的VM2执行环境
        const vm = new VM({
            timeout: 5000, // 5秒超时
            sandbox: {
                // 预定义可能会用到的变量
                $response: {},
                $data: {},
                $result: {},
                $request: {},
                $input: {},
                $output: {},
                $token: '',
                $key: '',
                $value: '',
                // 模拟浏览器环境
                window: {},
                document: { createElement: () => ({}) },
                navigator: { userAgent: '' },
                location: { href: '' },
                console: {
                    log: () => {},
                    error: () => {},
                    warn: () => {}
                }
            },
            eval: false,       // 禁止eval
            wasm: false,       // 禁止WebAssembly
            fixAsync: true     // 修复异步代码
        });

        // 编译并执行代码
        const script = new VMScript(`
            ${code}
            
            // 返回可能的结果
            if (typeof ﾟoﾟ !== "undefined") {
                ﾟoﾟ;
            } else {
                // 尝试找其他可能的输出变量
                null;
            }
        `);

        // 执行代码并获取结果
        const result = vm.run(script);
        
        // 处理结果
        if (result !== null) {
            if (typeof result === 'string') {
                return result;
            } else if (typeof result === 'object' && result !== null) {
                try {
                    return JSON.stringify(result, null, 2);
                } catch (e) {
                    return String(result);
                }
            } else {
                return String(result);
            }
        }
        
        // 如果直接获取ﾟoﾟ失败，尝试检查VM上下文中的变量
        try {
            const contextVars = vm.run(`
                Object.keys(this).filter(key => 
                    key.includes('ﾟ') || key.includes('_') || 
                    key.includes('o') || typeof this[key] === 'string'
                ).map(key => ({key, value: this[key]}));
            `);
            
            // 找到可能的结果变量
            for (const item of contextVars) {
                if (typeof item.value === 'string' && item.value.length > 5) {
                    return item.value;
                }
            }
        } catch (e) {
            console.error("检查上下文变量失败:", e.message);
        }
        
        // 尝试直接执行代码，忽略错误，看看是否有副作用设置了某些变量
        try {
            vm.run(code);
            // 检查是否有ﾟoﾟ变量被设置
            const oValue = vm.run('typeof ﾟoﾟ !== "undefined" ? ﾟoﾟ : null');
            if (oValue !== null) {
                return String(oValue);
            }
        } catch (e) {
            console.error("直接执行代码失败:", e.message);
        }
        
        // 如果还是无法获取有效结果，返回静态解析内容
        const extractedContent = code.replace(/ﾟ[\w\W]*?\(ﾟДﾟ\)\s*(?:'|")([^'"]*)(?:'|")/g, '$1');
        if (extractedContent !== code && extractedContent.length > 10) {
            return "// AAencode静态提取内容:\n" + extractedContent;
        }
        
        // 最后返回原始代码
        return "// AAencode解码失败，无法提取有效内容\n" + code;
        
    } catch (e) {
        console.error("AAencode解密失败:", e.message);
        return "// AAencode解密错误: " + e.message + "\n" + code;
    }
}

module.exports = decodeAAencode;