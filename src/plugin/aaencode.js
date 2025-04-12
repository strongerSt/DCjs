/**
 * AAencode (颜文字JavaScript) 解密插件 - 纯静态版本
 * 不执行代码，仅通过静态分析提取信息
 */
function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    if (!aaPattern.test(code) || !code.includes('_') || !code.includes('+') || !code.includes('=')) {
        return code; // 不是AAencode，返回原代码
    }

    // 创建一个更易读的简化版本
    let readableCode = code
        .replace(/ﾟωﾟﾉ/g, 'var1')
        .replace(/ﾟｰﾟ/g, 'var2')
        .replace(/ﾟΘﾟ/g, 'var3')
        .replace(/ﾟДﾟ/g, 'var4')
        .replace(/\(o\^_\^o\)/g, 'var5')
        .replace(/ﾟoﾟ/g, 'result');

    // 尝试提取所有字符串字面量
    const stringLiterals = [];
    code.replace(/(['"])((?:\\.|[^\\])*?)\1/g, (match, quote, content) => {
        if (content.length > 3) stringLiterals.push(content);
        return match;
    });

    // 尝试提取结构性信息
    const analysis = {
        variables: {},
        finalConstruction: '',
        possibleResults: []
    };

    // 分析变量赋值
    const assignmentPattern = /\(ﾟ[^=]+=([^;]+)/g;
    let match;
    while ((match = assignmentPattern.exec(code)) !== null) {
        if (match[1] && match[1].length < 100) { // 避免匹配过长的代码片段
            const varName = match[0].split('=')[0].trim();
            analysis.variables[varName] = match[1].trim();
        }
    }

    // 尝试识别最终构造的结果（通常在代码最后部分）
    const lastPart = code.split(';').pop();
    if (lastPart.includes('ﾟoﾟ') && lastPart.includes('+')) {
        analysis.finalConstruction = lastPart.trim();
    }

    // 尝试从字符连接模式中提取可能的结果
    // AAencode常常将字符一个一个连接起来
    const charPattern = /\(ﾟДﾟ\)\s*\[\s*['"]([a-z])['"]]/g;
    const chars = [];
    while ((match = charPattern.exec(code)) !== null) {
        if (match[1]) chars.push(match[1]);
    }

    if (chars.length > 0) {
        analysis.possibleResults.push(chars.join(''));
    }

    // 构建结果
    let result = "// AAencode静态解析结果：\n\n";
    
    // 添加最长的字符串字面量
    if (stringLiterals.length > 0) {
        const sortedStrings = [...stringLiterals].sort((a, b) => b.length - a.length);
        result += "// 找到的字符串字面量：\n";
        for (let i = 0; i < Math.min(5, sortedStrings.length); i++) {
            result += `// ${i+1}. ${sortedStrings[i]}\n`;
        }
        result += "\n";
    }
    
    // 添加可能的解码结果
    if (analysis.possibleResults.length > 0) {
        result += "// 可能的结果：\n";
        analysis.possibleResults.forEach(r => {
            result += `// ${r}\n`;
        });
        result += "\n";
    }
    
    // 添加简化代码
    result += "// 简化的代码：\n" + readableCode;
    
    return result;
}

module.exports = decodeAAencode;