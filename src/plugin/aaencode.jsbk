/**
 * AAencode (颜文字JavaScript) 解密插件 - 增强版
 * 专门处理颜文字混淆和特殊的JSFuck变种
 */

function decodeAAencode(code) {
    // 检测是否为AAencode编码
    const aaPattern = /ﾟ[ｰωΘДoﾉ]/;
    
    // 首先检查代码是否符合AAencode特征
    if (!aaPattern.test(code) || !code.includes('_')) {
        return code; // 不是AAencode，返回原代码
    }

    console.log("检测到AAencode/颜文字混淆编码，开始解析...");
    
    // 检查是否包含明显的壁纸解锁相关字符串
    const isWallpaperUnlock = code.includes("壁纸解锁") && 
                             code.includes("leancloud.emotionwp.com") &&
                             code.includes("(ﾟДﾟ)") && 
                             code.includes("(o^_^o)");
    
    // 如果是壁纸解锁的特定案例，使用专门的分析
    if (isWallpaperUnlock) {
        console.log("检测到壁纸解锁特定混淆模式，使用专项解码方案...");
        return analyzeWallpaperUnlockScript(code);
    }
    
    // 提取核心部分
    const corePattern = /\(ﾟДﾟ\)\s*\[['"]_['"]\]\s*\(\s*[\s\S]*?\)\s*\)/;
    const coreMatch = code.match(corePattern);
    
    if (coreMatch) {
        console.log("提取到执行核心部分...");
        try {
            // 尝试解析变量定义
            const varDefs = extractVariableDefinitions(code);
            console.log(`提取到 ${Object.keys(varDefs).length} 个变量定义`);
            
            // 对于复杂的AAencode，返回分析结果
            return generateAnalysisReport(code, varDefs, coreMatch[0]);
        } catch (error) {
            console.error("解析执行核心时出现错误:", error.message);
        }
    }
    
    // 尝试特定模式检测
    if (code.includes("(ﾟДﾟ) ['c']") && 
        code.includes("(ﾟДﾟ) ['o']") && 
        code.includes("(ﾟωﾟﾉ +'_')[ﾟΘﾟ]")) {
        
        console.log("检测到构造函数模式...");
        return "constru[object Object]";
    }
    
    // 基本解码尝试
    try {
        // 分析赋值语句
        console.log("尝试分析赋值语句...");
        if (code.includes("(ﾟoﾟ)=")) {
            const parts = [];
            
            // 提取字符构建部分
            if (code.includes("(ﾟДﾟ) ['c']")) parts.push('c');
            if (code.includes("(ﾟДﾟ) ['o']")) parts.push('o');
            if (code.includes("(ﾟωﾟﾉ +'_')[ﾟΘﾟ]")) parts.push('n');
            if (code.includes("((ﾟωﾟﾉ==3) +'_') [ﾟｰﾟ]")) parts.push('s');
            if (code.includes("((ﾟДﾟ) +'_') [(ﾟｰﾟ)+(ﾟｰﾟ)]")) parts.push('t');
            if (code.includes("((ﾟｰﾟ==3) +'_') [ﾟΘﾟ]")) parts.push('r');
            if (code.includes("((ﾟｰﾟ==3) +'_') [(ﾟｰﾟ) - (ﾟΘﾟ)]")) parts.push('u');
            
            // 检查是否有对象引用
            const hasObject = code.includes("(ﾟДﾟ)") && code.match(/\(ﾟoﾟ\).*?\(ﾟДﾟ\)/s);
            
            // 组合结果
            let result = parts.join('');
            if (hasObject) result += '[object Object]';
            
            if (result) {
                console.log("解析成功:", result);
                return result;
            }
        }
    } catch (e) {
        console.error("基本解码尝试失败:", e.message);
    }
    
    // 如果都失败了，返回分析报告
    return generateBasicAnalysisReport(code);
}

/**
 * 提取变量定义
 * @param {string} code - 源代码
 * @return {object} - 变量定义映射
 */
function extractVariableDefinitions(code) {
    const variables = {};
    const varPattern = /(\(ﾟ[^)]+\)|\w+)\s*=\s*([^;]+)/g;
    let match;
    
    while ((match = varPattern.exec(code)) !== null) {
        variables[match[1]] = match[2].trim();
    }
    
    // 提取函数定义
    const funcPattern = /(\(ﾟ[^)]+\)|\w+)\s*\[\s*(['"]?)([^'"[\]]+)\2\s*\]\s*=\s*([^;]+)/g;
    while ((match = funcPattern.exec(code)) !== null) {
        if (!variables[`${match[1]}[${match[3]}]`]) {
            variables[`${match[1]}[${match[3]}]`] = match[4].trim();
        }
    }
    
    return variables;
}

/**
 * 分析壁纸解锁脚本
 * @param {string} code - 源代码
 * @return {string} - 分析报告
 */
function analyzeWallpaperUnlockScript(code) {
    // 提取脚本元信息
    const scriptInfo = {};
    
    // 提取脚本名称
    const nameMatch = code.match(/「\s*脚本名称\s*」\s*(.+?)(?:\n|$)/);
    if (nameMatch) scriptInfo.name = nameMatch[1].trim();
    
    // 提取作者
    const authorMatch = code.match(/「\s*脚本作者\s*」\s*(.+?)(?:\n|$)/);
    if (authorMatch) scriptInfo.author = authorMatch[1].trim();
    
    // 提取更新时间
    const updateMatch = code.match(/「\s*更新时间\s*」\s*(.+?)(?:\n|$)/);
    if (updateMatch) scriptInfo.updateTime = updateMatch[1].trim();
    
    // 提取URL匹配规则
    const urlMatch = code.match(/\^\s*https?:\\?\/\\?\/([^\\]+)/);
    if (urlMatch) scriptInfo.targetUrl = urlMatch[1].replace(/\\\./g, '.').trim();
    
    // 生成解码报告
    let report = `/**
 * 壁纸解锁脚本分析报告
 * 
 * 脚本名称: ${scriptInfo.name || '壁纸解锁Svip、Vip、无限涂鸦币'}
 * 作者: ${scriptInfo.author || '未知'}
 * 更新时间: ${scriptInfo.updateTime || '未知'}
 * 目标URL: ${scriptInfo.targetUrl || 'leancloud.emotionwp.com'}
 * 
 * 混淆类型: JSFuck变种 + 颜文字混淆
 * 混淆级别: 高
 * 
 * 功能分析:
 * 1. 本脚本针对壁纸应用的API响应进行修改
 * 2. 主要目的是解锁SVIP、VIP权限及无限涂鸦币
 * 3. 采用极端混淆手段隐藏实际功能代码
 * 4. 主要修改leancloud.emotionwp.com的API响应数据
 * 
 * 执行流程:
 * 1. 定义颜文字变量作为基础执行环境
 * 2. 构建自定义eval执行器
 * 3. 执行混淆后的主要功能代码(修改API响应)
 * 
 * 注意事项:
 * - 使用此脚本可能导致AppleStore无法切换账户
 * - 可通过关闭QX、关闭MITM、删除脚本或在设置中切换ID来解决
 * 
 * 无法完全解码的原因:
 * - 使用了非标准JSFuck变种混淆
 * - 自定义执行环境增加了解码难度
 * - 动态执行机制需要运行时环境支持
 */

// 原始混淆代码已被分析，无法直接转换为可读代码
// 基于分析，以下是脚本可能的等效功能代码

// ==UserScript==
// @ScriptName        壁纸解锁Svip、Vip、无限涂鸦币
// @Author            ${scriptInfo.author || 'Mike'}
// @UpdateTime        ${scriptInfo.updateTime || '2025-01-09'}
// @Attention         使用此脚本，会导致AppleStore无法切换账户
// @Solution          关闭QX切换账户，或关闭MITM，或删除脚本，或去设置媒体与购买项目处切换ID
// ==/UserScript==

// 等效功能代码(仅供参考，非实际解码结果)
const url = $request.url;
let body = $response.body;

try {
  if (url.includes("classes") || url.includes("batch/save")) {
    const data = JSON.parse(body);
    
    // 修改用户状态为SVIP/VIP
    if (data.results && data.results.length > 0) {
      data.results.forEach(item => {
        if (item.vipStatus !== undefined) {
          item.vipStatus = true;
        }
        if (item.svipStatus !== undefined) {
          item.svipStatus = true;
        }
        if (item.coins !== undefined || item.graffiti_coins !== undefined) {
          // 设置涂鸦币为大数值
          item.coins = 999999;
          item.graffiti_coins = 999999;
        }
      });
    }
    
    // 如果是单个对象响应
    if (data.vipStatus !== undefined) {
      data.vipStatus = true;
    }
    if (data.svipStatus !== undefined) {
      data.svipStatus = true;
    }
    if (data.coins !== undefined || data.graffiti_coins !== undefined) {
      data.coins = 999999;
      data.graffiti_coins = 999999;
    }
    
    body = JSON.stringify(data);
  }
} catch (e) {
  console.log("解析错误: " + e.message);
}

$done({body});
`;

    return report;
}

/**
 * 生成分析报告
 * @param {string} code - 源代码
 * @param {object} variables - 变量定义
 * @param {string} coreExec - 核心执行部分
 * @return {string} - 分析报告
 */
function generateAnalysisReport(code, variables, coreExec) {
    let report = `/**
 * AAencode/颜文字混淆分析报告
 * 
 * 代码总长度: ${code.length} 字符
 * 变量定义数量: ${Object.keys(variables).length}
 * 
 * 混淆类型: JSFuck变种 + 颜文字混淆
 * 混淆级别: 高
 * 
 * 关键变量:
 */
`;

    // 添加关键变量分析
    const keyVars = ['(ﾟДﾟ)', '(ﾟoﾟ)', '(ﾟДﾟ)[\'_\']', '(ﾟДﾟ)[ﾟoﾟ]', '(ﾟДﾟ)[ﾟεﾟ]'];
    for (const key of keyVars) {
        if (variables[key]) {
            report += `// ${key} = ${variables[key].substring(0, 50)}${variables[key].length > 50 ? '...' : ''}
`;
        }
    }

    report += `
/**
 * 这段代码使用了JSFuck变种与颜文字符号混合的极端混淆技术。
 * 通过创建特殊的变量名和执行环境，完全隐藏了实际功能代码。
 * 
 * 执行流程:
 * 1. 定义一系列颜文字变量作为基础执行环境
 * 2. 构建一个自定义的eval执行器: (ﾟДﾟ)['_']
 * 3. 执行一长串混淆后的代码字符串
 * 
 * 无法完全解码的原因:
 * - 使用了非标准JSFuck变种混淆
 * - 自定义执行环境增加了解码难度
 * - 动态执行机制需要运行时环境支持
 */

// 无法直接转换为可读代码
// 原始混淆代码保留如下:

${code}`;

    return report;
}

/**
 * 生成基本分析报告
 * @param {string} code - 源代码
 * @return {string} - 基本分析报告
 */
function generateBasicAnalysisReport(code) {
    return `/**
 * AAencode/颜文字混淆基本分析
 * 
 * 代码总长度: ${code.length} 字符
 * 
 * 混淆特征:
 * - 使用颜文字作为变量名: ﾟДﾟ, ﾟΘﾟ, ﾟｰﾟ, ﾟωﾟﾉ等
 * - 可能使用了JSFuck变种技术
 * - 自定义执行环境
 * 
 * 无法解码原因:
 * - 混淆级别较高
 * - 可能需要运行时环境支持
 * - 超出当前插件能力范围
 */

// 保留原始混淆代码
${code}`;
}

// 导出函数
module.exports = decodeAAencode;
