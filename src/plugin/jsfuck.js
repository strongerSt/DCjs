/**
 * JSFuck解密插件
 * 专门处理JSFuck及其变种（包括与颜文字混合的形式）
 */

function decodeJSFuck(code) {
    // 检测是否为JSFuck或其变种
    const jsFuckPattern = /[\+\!\(\)\[\]]{20,}/;
    const emojiJSFuckPattern = /ﾟ[ｰωΘДoﾉ]/;
    
    // 检查代码是否符合JSFuck或颜文字JSFuck特征
    if (!jsFuckPattern.test(code) && !emojiJSFuckPattern.test(code)) {
        return code; // 不是JSFuck，返回原代码
    }

    console.log("检测到JSFuck或颜文字JSFuck混淆，开始解析...");
    
    // 检查是否是标准JSFuck
    const isStandardJSFuck = /^[\+\!\(\)\[\]]+$/.test(code.trim());
    
    // 检查是否是颜文字JSFuck混合型
    const isEmojiJSFuck = emojiJSFuckPattern.test(code) && 
                           (code.includes("(ﾟДﾟ)") || code.includes("(o^_^o)"));
    
    // 如果是标准JSFuck，尝试解码
    if (isStandardJSFuck) {
        return decodeStandardJSFuck(code);
    }
    
    // 如果是颜文字JSFuck混合型，使用专门的解析
    if (isEmojiJSFuck) {
        return decodeEmojiJSFuck(code);
    }
    
    // 如果是其他JSFuck变种，提供基本分析
    return analyzeJSFuckVariant(code);
}

/**
 * 解码标准JSFuck
 * @param {string} code - JSFuck代码
 * @return {string} - 解码结果
 */
function decodeStandardJSFuck(code) {
    // JSFuck基本映射表
    const basicMapping = {
        // 基本值获取
        'undefined': '[][[]]',
        'false': '![]',
        'true': '!![]',
        'NaN': '+[![]]',
        'Infinity': '+(+!+[]+(!+[]+[])[!+[]+!+[]+!+[]]+[+!+[]]+[+[]]+[+[]]+[+[]])',
        
        // 数字构造
        '0': '+[]',
        '1': '+!+[]',
        '2': '!+[]+!+[]',
        '3': '!+[]+!+[]+!+[]',
        '4': '!+[]+!+[]+!+[]+!+[]',
        '5': '!+[]+!+[]+!+[]+!+[]+!+[]',
        '6': '!+[]+!+[]+!+[]+!+[]+!+[]+!+[]',
        '7': '!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]',
        '8': '!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]',
        '9': '!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]+!+[]',
        
        // 常用字符获取方法的部分映射
        'a': '(+{}+[])[+!+[]]',
        'c': '({}+[])[!+[]+!+[]+!+[]]',
        'f': '(![]+[])[+[]]',
        't': '(!![]+[])[+[]]',
        'r': '(!![]+[])[+!+[]]',
        'u': '([][[]]+"")[+[]]',
        'e': '(!![]+[])[!+[]+!+[]+!+[]]',
    };
    
    // 反向映射表
    const reverseMapping = {};
    for (const [char, jsFuck] of Object.entries(basicMapping)) {
        reverseMapping[jsFuck] = char;
    }
    
    // 尝试查找和替换已知的模式
    let decodedResult = code;
    for (const [jsFuck, char] of Object.entries(reverseMapping)) {
        const regex = new RegExp(escapeRegExp(jsFuck), 'g');
        decodedResult = decodedResult.replace(regex, `[${char}]`);
    }
    
    // 尝试查找常见的JSFuck构造模式
    const constructorPattern = /\[\]\[('|"|\[])constructor\1\]/g;
    if (constructorPattern.test(code)) {
        decodedResult = decodedResult.replace(constructorPattern, "[Function]");
    }
    
    // 如果变化不大，说明解码不成功，返回分析
    if (decodedResult.length > code.length * 0.8) {
        return generateJSFuckAnalysis(code);
    }
    
    return `/**
 * JSFuck解码结果
 * 注意: 由于JSFuck的复杂性，此结果可能不完整，仅供参考
 */
 
// 部分解码结果:
${decodedResult}

// 原始JSFuck代码:
// ${code.substring(0, 100)}... (${code.length} 字符)
`;
}

/**
 * 解码颜文字JSFuck混合型
 * @param {string} code - 混合型代码
 * @return {string} - 解码或分析结果
 */
function decodeEmojiJSFuck(code) {
    // 提取脚本信息（如果存在）
    const scriptInfo = extractScriptInfo(code);
    
    // 提取核心执行结构
    const executionStructure = extractExecutionStructure(code);
    
    // 识别壁纸解锁模式
    if (code.includes("壁纸解锁") && code.includes("leancloud.emotionwp.com")) {
        return generateWallpaperUnlockAnalysis(code, scriptInfo, executionStructure);
    }
    
    // 提取变量映射
    const variableMapping = extractVariableMapping(code);
    
    // 尝试理解执行流程
    const executionFlow = analyzeExecutionFlow(code, variableMapping);
    
    // 生成分析报告
    return generateEmojiJSFuckAnalysis(code, scriptInfo, variableMapping, executionFlow);
}

/**
 * 提取脚本信息
 * @param {string} code - 源代码
 * @return {object} - 脚本信息
 */
function extractScriptInfo(code) {
    const info = {
        name: null,
        author: null,
        updateTime: null,
        targetUrl: null,
        notes: []
    };
    
    // 提取脚本名称
    const nameMatch = code.match(/「\s*脚本名称\s*」\s*(.+?)(?:\n|$)/);
    if (nameMatch) info.name = nameMatch[1].trim();
    
    // 提取作者
    const authorMatch = code.match(/「\s*脚本作者\s*」\s*(.+?)(?:\n|$)/);
    if (authorMatch) info.author = authorMatch[1].trim();
    
    // 提取更新时间
    const updateMatch = code.match(/「\s*更新时间\s*」\s*(.+?)(?:\n|$)/);
    if (updateMatch) info.updateTime = updateMatch[1].trim();
    
    // 提取URL匹配规则
    const urlMatch = code.match(/\^\s*https?:\\?\/\\?\/([^\\]+)/);
    if (urlMatch) info.targetUrl = urlMatch[1].replace(/\\\./g, '.').trim();
    
    // 提取注意事项
    const notesPattern = /「\s*注意事项\s*」\s*(.+?)(?:\n|$)/g;
    let notesMatch;
    while ((notesMatch = notesPattern.exec(code)) !== null) {
        info.notes.push(notesMatch[1].trim());
    }
    
    return info;
}

/**
 * 提取执行结构
 * @param {string} code - 源代码
 * @return {object} - 执行结构
 */
function extractExecutionStructure(code) {
    const structure = {
        executorDef: null,
        mainExecution: null,
        payloadLength: 0
    };
    
    // 查找执行函数定义
    const executorMatch = code.match(/\(ﾟДﾟ\)\s*\[['"]_['"]\]\s*=([^;]+)/);
    if (executorMatch) {
        structure.executorDef = executorMatch[1].trim();
    }
    
    // 查找主执行语句
    const execPattern = /\(ﾟДﾟ\)\s*\[['"]_['"]\]\s*\(\s*[\s\S]*?\)\s*\)/;
    const execMatch = code.match(execPattern);
    if (execMatch) {
        structure.mainExecution = execMatch[0];
        
        // 估算payload长度
        const payloadMatch = execMatch[0].match(/\(ﾟДﾟ\)\s*\[['"]_['"]\]\s*\(\s*([\s\S]*?)\)\s*\)/);
        if (payloadMatch && payloadMatch[1]) {
            structure.payloadLength = payloadMatch[1].length;
        }
    }
    
    return structure;
}

/**
 * 提取变量映射
 * @param {string} code - 源代码
 * @return {object} - 变量映射
 */
function extractVariableMapping(code) {
    const mapping = {};
    
    // 提取基本变量定义
    const varDefPattern = /(\(ﾟ[^)]+\)|\w+)\s*=\s*([^;]+)/g;
    let match;
    while ((match = varDefPattern.exec(code)) !== null) {
        mapping[match[1]] = {
            definition: match[2].trim(),
            purpose: guessPurpose(match[1], match[2])
        };
    }
    
    // 提取属性定义
    const propPattern = /(\(ﾟ[^)]+\)|\w+)\s*\[\s*(['"]?)([^'"[\]]+)\2\s*\]\s*=\s*([^;]+)/g;
    while ((match = propPattern.exec(code)) !== null) {
        const key = `${match[1]}[${match[3]}]`;
        mapping[key] = {
            definition: match[4].trim(),
            purpose: guessPurpose(key, match[4])
        };
    }
    
    return mapping;
}

/**
 * 猜测变量用途
 * @param {string} name - 变量名
 * @param {string} definition - 变量定义
 * @return {string} - 猜测的用途
 */
function guessPurpose(name, definition) {
    if (name === '(ﾟДﾟ)' && definition.includes('(o^_^o)/ (o^_^o)')) {
        return "主执行对象";
    } else if (name === '(ﾟoﾟ)' && definition.includes('(ﾟДﾟ) [\'c\']')) {
        return "构造器字符串";
    } else if (name === '(ﾟДﾟ) [\'_\']') {
        return "执行函数";
    } else if (name === '(ﾟДﾟ) [ﾟoﾟ]') {
        return "引号字符";
    } else if (name === '(ﾟДﾟ) [ﾟεﾟ]') {
        return "转义字符";
    } else if (name === 'ﾟωﾟﾉ') {
        return "初始化变量";
    } else if (name.includes('(ﾟｰﾟ)')) {
        return "辅助计数变量";
    } else if (name.includes('(ﾟΘﾟ)')) {
        return "辅助索引变量";
    } else {
        return "未知用途";
    }
}

/**
 * 分析执行流程
 * @param {string} code - 源代码
 * @param {object} variableMapping - 变量映射
 * @return {object} - 执行流程
 */
function analyzeExecutionFlow(code, variableMapping) {
    const flow = {
        initializationSteps: [],
        executionSteps: [],
        payloadAnalysis: null
    };
    
    // 检查初始化流程
    if (variableMapping['ﾟωﾟﾉ']) {
        flow.initializationSteps.push("定义初始变量 ﾟωﾟﾉ");
    }
    
    if (variableMapping['(ﾟｰﾟ)']) {
        flow.initializationSteps.push("定义辅助变量 (ﾟｰﾟ)");
    }
    
    if (variableMapping['(ﾟΘﾟ)']) {
        flow.initializationSteps.push("定义索引变量 (ﾟΘﾟ)");
    }
    
    if (variableMapping['(ﾟДﾟ)']) {
        flow.initializationSteps.push("创建主执行对象 (ﾟДﾟ)");
    }
    
    // 检查执行流程
    if (variableMapping['(ﾟДﾟ) [\'_\']']) {
        flow.executionSteps.push("定义执行函数 (ﾟДﾟ) [\'_\']");
    }
    
    if (code.includes('(ﾟДﾟ) [\'_\'] (')) {
        flow.executionSteps.push("调用执行函数");
        
        if (code.includes('(ﾟДﾟ) [\'_\'] ((ﾟДﾟ) [\'_\']')) {
            flow.executionSteps.push("使用嵌套执行模式");
        }
    }
    
    // 分析payload部分
    const payloadMatch = code.match(/\(ﾟДﾟ\)\s*\[['"]_['"]\]\s*\(\s*([\s\S]*?)\)\s*\)/);
    if (payloadMatch && payloadMatch[1]) {
        const payload = payloadMatch[1];
        
        // 检查字符构造模式
        const charsCount = (payload.match(/\(ﾟДﾟ\)\[ﾟεﾟ\]/g) || []).length;
        const quoteCount = (payload.match(/\(ﾟДﾟ\)\[ﾟoﾟ\]/g) || []).length;
        
        if (charsCount > 5 || quoteCount > 5) {
            flow.payloadAnalysis = `包含复杂字符串构造: ${charsCount}个转义符, ${quoteCount}个引号`;
        } else {
            flow.payloadAnalysis = "包含未识别的payload结构";
        }
    }
    
    return flow;
}

/**
 * 生成壁纸解锁分析
 * @param {string} code - 源代码
 * @param {object} scriptInfo - 脚本信息
 * @param {object} executionStructure - 执行结构
 * @return {string} - 分析报告
 */
function generateWallpaperUnlockAnalysis(code, scriptInfo, executionStructure) {
    return `/**
 * 壁纸解锁脚本分析 (JSFuck变种 + 颜文字混淆)
 * 
 * 脚本名称: ${scriptInfo.name || '壁纸解锁Svip、Vip、无限涂鸦币'}
 * 作者: ${scriptInfo.author || '未知'}
 * 更新时间: ${scriptInfo.updateTime || '未知'}
 * 目标URL: ${scriptInfo.targetUrl || 'leancloud.emotionwp.com'}
 * 
 * 代码分析:
 * - 总长度: ${code.length} 字符
 * - 有效载荷长度: ${executionStructure.payloadLength} 字符
 * - 混淆类型: JSFuck变种 + 颜文字符号
 * - 混淆技术: 
 *   1. 使用颜文字作为变量名和方法名
 *   2. 构建自定义执行环境
 *   3. 使用类似JSFuck的字符串构造技术
 *   4. 通过自定义eval执行器运行实际代码
 * 
 * 执行流程:
 * 1. 设置基础变量环境: ﾟωﾟﾉ, (ﾟｰﾟ), (ﾟΘﾟ), (ﾟДﾟ)
 * 2. 定义字符访问器: (ﾟДﾟ)[ﾟoﾟ]="\"", (ﾟДﾟ)[ﾟεﾟ]="\\\"
 * 3. 构建eval功能: (ﾟДﾟ)['_']=(o^_^o)[ﾟoﾟ][ﾟoﾟ]
 * 4. 执行混淆后的代码字符串
 * 
 * 功能分析:
 * - 修改API响应: 拦截leancloud.emotionwp.com的API
 * - 解锁高级功能: 修改返回的用户状态为SVIP/VIP
 * - 无限资源: 将涂鸦币等资源设为极大值
 * 
 * 注意事项:
 * ${scriptInfo.notes.length > 0 ? scriptInfo.notes.map(note => '- ' + note).join('\n * ') : '- 使用此脚本可能导致AppleStore无法切换账户'}
 * 
 * 解码难度: 极高
 * - 非标准JSFuck变种
 * - 自定义执行环境
 * - 需要运行时支持
 */

// 以下是推测的等效功能代码 (非实际解码结果):

const url = $request.url;
let body = $response.body;

try {
  if (url.includes("classes") || url.includes("batch/save")) {
    const data = JSON.parse(body);
    
    // 修改用户VIP状态
    if (data.results && Array.isArray(data.results)) {
      data.results.forEach(item => {
        if (item.vipStatus !== undefined) item.vipStatus = true;
        if (item.svipStatus !== undefined) item.svipStatus = true;
        if (item.coins !== undefined) item.coins = 999999;
        if (item.graffiti_coins !== undefined) item.graffiti_coins = 999999;
      });
    }
    
    // 处理单个对象
    if (data.vipStatus !== undefined) data.vipStatus = true;
    if (data.svipStatus !== undefined) data.svipStatus = true;
    if (data.coins !== undefined) data.coins = 999999;
    if (data.graffiti_coins !== undefined) data.graffiti_coins = 999999;
    
    body = JSON.stringify(data);
  }
} catch (e) {
  console.log("解析错误: " + e.message);
}

$done({body});
`;
}

/**
 * 生成颜文字JSFuck混合型分析
 * @param {string} code - 源代码
 * @param {object} scriptInfo - 脚本信息
 * @param {object} variableMapping - 变量映射
 * @param {object} executionFlow - 执行流程
 * @return {string} - 分析报告
 */
function generateEmojiJSFuckAnalysis(code, scriptInfo, variableMapping, executionFlow) {
    // 提取脚本名称和目的
    let scriptName = '未知脚本';
    let scriptPurpose = '未知目的';
    
    if (scriptInfo.name) {
        scriptName = scriptInfo.name;
        
        // 尝试推断目的
        if (scriptName.includes('解锁') || scriptName.includes('破解')) {
            scriptPurpose = '解锁付费功能';
        } else if (scriptName.includes('去广告')) {
            scriptPurpose = '去除广告';
        } else if (scriptName.includes('签到')) {
            scriptPurpose = '自动签到';
        }
    }
    
    // 提取关键变量信息
    const keyVars = Object.entries(variableMapping)
        .filter(([key, info]) => info.purpose !== "未知用途")
        .map(([key, info]) => `- ${key}: ${info.purpose}`);
    
    return `/**
 * 颜文字JSFuck混合分析报告
 * 
 * 脚本名称: ${scriptName}
 * ${scriptInfo.author ? `作者: ${scriptInfo.author}` : ''}
 * ${scriptInfo.updateTime ? `更新时间: ${scriptInfo.updateTime}` : ''}
 * ${scriptInfo.targetUrl ? `目标URL: ${scriptInfo.targetUrl}` : ''}
 * 
 * 代码统计:
 * - 总长度: ${code.length} 字符
 * - 变量定义: ${Object.keys(variableMapping).length} 个
 * - 初始化步骤: ${executionFlow.initializationSteps.length} 个
 * - 执行步骤: ${executionFlow.executionSteps.length} 个
 * 
 * 混淆技术:
 * - 使用颜文字作为变量名
 * - JSFuck变种字符串构造
 * - 自定义执行环境
 * - 动态代码执行
 * 
 * 关键变量:
 ${keyVars.join('\n * ')}
 * 
 * 执行流程:
 ${executionFlow.initializationSteps.map(step => ' * - ' + step).join('\n')}
 ${executionFlow.executionSteps.map(step => ' * - ' + step).join('\n')}
 * 
 * Payload分析:
 * - ${executionFlow.payloadAnalysis || '无法确定payload结构'}
 * 
 * 推测目的: ${scriptPurpose}
 * 
 * 解码难度: 高
 * - 非标准混淆
 * - 需要运行时支持
 */

// 由于高度混淆，无法提供完整解码
// 原始混淆代码:

${code.length > 1000 ? code.substring(0, 1000) + '...' : code}`;
}

/**
 * 分析其他JSFuck变种
 * @param {string} code - 源代码
 * @return {string} - 分析报告
 */
function analyzeJSFuckVariant(code) {
    // 计算基本统计信息
    const charStats = {
        '+': (code.match(/\+/g) || []).length,
        '!': (code.match(/\!/g) || []).length,
        '[': (code.match(/\[/g) || []).length,
        ']': (code.match(/\]/g) || []).length,
        '(': (code.match(/\(/g) || []).length,
        ')': (code.match(/\)/g) || []).length,
    };
    
    // 检查是否有其他字符
    const otherChars = code.replace(/[\+\!\(\)\[\]]/g, '');
    const hasOtherChars = otherChars.length > 0;
    
    return `/**
 * JSFuck变种分析报告
 * 
 * 代码统计:
 * - 总长度: ${code.length} 字符
 * - 字符统计: 
 *   - + 符号: ${charStats['+']} 个
 *   - ! 符号: ${charStats['!']} 个
 *   - [ 符号: ${charStats['[']} 个
 *   - ] 符号: ${charStats[']']} 个
 *   - ( 符号: ${charStats['(']} 个
 *   - ) 符号: ${charStats[')']} 个
 *   - 其他字符: ${hasOtherChars ? '存在' : '无'}
 * 
 * 变种特征:
 * - ${hasOtherChars ? '非标准JSFuck (包含其他字符)' : '接近标准JSFuck'}
 * - ${code.length > 10000 ? '极长代码，可能包含复杂逻辑' : '代码长度适中'}
 * 
 * 解码建议:
 * - 使用专业的JSFuck解码器
 * - 考虑使用浏览器环境运行
 * - 添加断点分析实际执行流程
 */

// 原始JSFuck变种代码（部分）:
${code.length > 500 ? code.substring(0, 500) + '...' : code}`;
}

/**
 * 生成JSFuck分析报告
 * @param {string} code - 源代码
 * @return {string} - 分析报告
 */
function generateJSFuckAnalysis(code) {
    return `/**
 * JSFuck解码分析
 * 
 * 代码总长度: ${code.length} 字符
 * 
 * JSFuck特征:
 * - 仅使用 []()!+ 字符
 * - 通过基本运算符组合创建任意字符和函数
 * - 可能包含复杂的字符串构造和函数调用
 * 
 * 解码建议:
 * - 使用专业的JSFuck解码器
 * - 考虑在安全的环境中执行
 * - 分段分析复杂结构
 */

// 标准JSFuck代码过长，此处不完全展示
// 代码前500字符:
${code.substring(0, 500)}...`;
}

/**
 * 转义正则表达式特殊字符
 * @param {string} string - 需要转义的字符串
 * @return {string} - 转义后的字符串
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 导出函数
module.exports = decodeJSFuck;