/**
 * AAencode (颜文字JavaScript) 解密插件 - 加强版
 * 尝试多种方法解析AAencode代码
 */

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }
    
    console.log("检测到AAencode编码，正在尝试解码...");
    
    try {
        // 提取所有可能的字符串
        const allStrings = extractAllStrings(code);
        
        // 1. 尝试使用Function执行（如果环境允许）
        let execResult = "";
        try {
            // 创建一个安全的执行环境
            const safeExec = new Function(`
                try {
                    // 定义可能需要的变量
                    var window = {};
                    var document = {};
                    var navigator = { userAgent: '' };
                    var location = { href: '' };
                    var $response = {};
                    var $request = {};
                    var $data = {};
                    
                    // 执行AAencode代码
                    ${code}
                    
                    // 尝试获取结果
                    if (typeof ﾟoﾟ !== "undefined") {
                        return ﾟoﾟ;
                    }
                    return null;
                } catch(e) {
                    return "执行错误: " + e.message;
                }
            `);
            
            execResult = safeExec();
            if (execResult && typeof execResult === 'string' && !execResult.startsWith("执行错误")) {
                console.log("成功通过执行获取AAencode结果");
                return execResult;
            }
        } catch(e) {
            console.log("执行AAencode失败:", e.message);
        }
        
        // 2. 尝试将代码转换为可读形式并提取模式
        const simplified = simplifyCode(code);
        
        // 3. 从最终赋值语句分析
        const finalAssignment = extractFinalAssignment(code);
        if (finalAssignment && finalAssignment.length > 10) {
            console.log("从最终赋值语句提取内容");
            return finalAssignment;
        }
        
        // 4. 提取字符拼接
        const charConcats = extractCharConcats(code);
        if (charConcats && charConcats.length > 0) {
            const longestConcat = charConcats.sort((a, b) => b.length - a.length)[0];
            if (longestConcat.length > 10) {
                console.log("从字符拼接提取内容");
                return longestConcat;
            }
        }
        
        // 5. 通过正则模式提取可能有意义的块
        const patternBlocks = extractPatternBlocks(code);
        if (patternBlocks && patternBlocks.length > 0) {
            console.log("通过模式提取块内容");
            return patternBlocks.join("\n\n");
        }
        
        // 6. 如果有字符串，返回最有可能的那些
        if (allStrings.length > 0) {
            // 过滤掉太短或可能是变量名的字符串
            const meaningfulStrings = allStrings.filter(s => 
                s.length > 5 && 
                !s.match(/^[a-zA-Z0-9_]+$/) &&
                s !== "undefined" &&
                s !== "constructor"
            );
            
            if (meaningfulStrings.length > 0) {
                // 按长度排序
                meaningfulStrings.sort((a, b) => b.length - a.length);
                console.log("找到可能有意义的字符串");
                
                let result = "// AAencode提取的字符串：\n";
                for (let i = 0; i < Math.min(5, meaningfulStrings.length); i++) {
                    result += `// ${i+1}. ${meaningfulStrings[i]}\n`;
                }
                return result;
            }
        }
        
        // 如果所有方法都失败，返回简化的代码
        console.log("所有解码方法失败，返回简化代码");
        return "// AAencode简化代码：\n" + simplified;
        
    } catch (e) {
        console.error("AAencode解码失败:", e.message);
        return `// AAencode解码错误: ${e.message}\n${code}`;
    }
}

// 辅助函数：简化AAencode代码
function simplifyCode(code) {
    return code
        .replace(/ﾟωﾟﾉ/g, 'var1')
        .replace(/ﾟｰﾟ/g, 'var2')
        .replace(/ﾟΘﾟ/g, 'var3')
        .replace(/ﾟДﾟ/g, 'var4')
        .replace(/\(o\^_\^o\)/g, 'var5')
        .replace(/ﾟoﾟ/g, 'result');
}

// 辅助函数：提取所有字符串
function extractAllStrings(code) {
    const strings = [];
    code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
        if (content && content.trim()) {
            strings.push(content);
        }
        return match;
    });
    return strings;
}

// 辅助函数：尝试从最终的赋值语句提取内容
function extractFinalAssignment(code) {
    // 查找最后的赋值语句，通常是 (ﾟoﾟ)=...
    const finalAssignMatch = code.match(/\(ﾟoﾟ\)\s*=\s*([^;]+)/);
    if (finalAssignMatch && finalAssignMatch[1]) {
        // 从赋值右侧提取潜在的字符串构造
        const assignmentRight = finalAssignMatch[1];
        
        // 查找所有可能的字符引用，如 (ﾟДﾟ) ['c']
        const charRefs = [];
        const charRefPattern = /\(ﾟДﾟ\)\s*\[\s*['"]([a-z])['"]]/g;
        let match;
        while ((match = charRefPattern.exec(assignmentRight)) !== null) {
            if (match[1]) {
                charRefs.push(match[1]);
            }
        }
        
        if (charRefs.length > 0) {
            return charRefs.join('');
        }
    }
    return null;
}

// 辅助函数：提取字符拼接
function extractCharConcats(code) {
    // 查找常见的字符拼接模式
    const concats = [];
    
    // 模式1: +' '+ 类型的拼接
    const pattern1 = /['"]([^'"]+)['"]\s*\+\s*['"]([^'"]+)['"]/g;
    let fragments = [];
    let match;
    
    while ((match = pattern1.exec(code)) !== null) {
        if (match[1] && match[2]) {
            fragments.push(match[1] + match[2]);
        }
    }
    
    if (fragments.length > 0) {
        concats.push(fragments.join(''));
    }
    
    // 模式2: 连续的字符添加
    const charAdditions = code.match(/\+['"]([a-z])['"]|\+['"]([0-9])['"]|\+['"]([ \t])['"]|\+['"]([^a-z0-9 \t])['"]|\+['"]['"]/g);
    if (charAdditions && charAdditions.length > 0) {
        let concat = '';
        charAdditions.forEach(add => {
            const char = add.match(/\+['"]([^'"]*)['"]/) || add.match(/\+([a-z0-9])/) || add.match(/\+(['"])/) || ['', ''];
            concat += char[1] || '';
        });
        if (concat.length > 0) {
            concats.push(concat);
        }
    }
    
    return concats;
}

// 辅助函数：通过特定模式提取可能有意义的代码块
function extractPatternBlocks(code) {
    const blocks = [];
    
    // 查找通过+=操作不断添加的字符串块
    const assignAddPattern = /([a-zA-Z0-9_$]+)\s*\+=\s*(['"])([^'"]+)\2/g;
    const assignAdds = {};
    
    while ((match = assignAddPattern.exec(code)) !== null) {
        const varName = match[1];
        const content = match[3];
        
        if (!assignAdds[varName]) {
            assignAdds[varName] = [];
        }
        assignAdds[varName].push(content);
    }
    
    // 合并同一变量的所有+=操作
    for (const varName in assignAdds) {
        if (assignAdds[varName].length > 1) {
            const combined = assignAdds[varName].join('');
            if (combined.length > 10) {
                blocks.push(`// ${varName} 合并内容:\n${combined}`);
            }
        }
    }
    
    // 查找加密的正则表达式或特殊模式
    const regexPattern = /\/[^\/]+\/[gimuy]*/g;
    while ((match = regexPattern.exec(code)) !== null) {
        if (match[0].length > 10) {
            blocks.push(`// 正则表达式:\n${match[0]}`);
        }
    }
    
    return blocks;
}

// 导出函数
module.exports = decodeAAencode;