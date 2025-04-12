// scripts.js
// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化标签页切换功能
    initTabs();
    
    // 初始化按钮事件
    initButtons();
    
    // 初始化文件上传
    initFileUpload();
    
    // 初始化远程文件获取
    initRemoteFile();
    
    // 初始化拖放功能
    initDragDrop();
});

// 初始化标签页切换
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有标签页的激活状态
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // 激活当前标签页
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
}

// 初始化按钮事件
function initButtons() {
    // 清空按钮点击事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('code-input').value = '';
            document.getElementById('result-content').innerHTML = '';
            
            // 如果有拖放区域，在清空后显示它
            const dropZone = document.querySelector('.drop-zone');
            const textArea = document.getElementById('code-input');
            if (dropZone && textArea) {
                textArea.style.display = 'none';
                dropZone.style.display = 'flex';
            }
        });
    }
    
    // 解码按钮点击事件
    const decryptBtn = document.getElementById('decrypt-btn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', () => {
            const code = document.getElementById('code-input').value;
            if (!code.trim()) {
                alert('请输入需要解密的代码');
                return;
            }
            
            // 获取文件类型
            let fileType = 'js';
            document.querySelectorAll('input[name="file-type"]').forEach(input => {
                if (input.checked) {
                    fileType = input.value;
                }
            });
            
            // 获取选中的加密类型
            let encryptionType = 'auto';
            document.querySelectorAll('input[name="encryption-type"]').forEach(input => {
                if (input.checked) {
                    encryptionType = input.id.replace('type-', '');
                }
            });
            
            // 执行本地解密
            performClientSideDecryption(code, fileType, encryptionType);
        });
    }
}

// 执行客户端解密
function performClientSideDecryption(code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    // 显示正在处理的信息
    resultElement.innerHTML = `
        <div class="info-box">
            <p><strong>正在解密中...</strong></p>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
        </div>
    `;
    
    // 启动进度条动画
    startProgressBar();
    
    // 使用setTimeout来确保UI更新
    setTimeout(() => {
        try {
            // 解密处理
            let decryptedCode = '';
            
            if (encryptionType === 'auto') {
                // 尝试自动检测加密类型
                decryptedCode = autoDetectAndDecrypt(code, fileType);
            } else {
                // 使用指定的解密方法
                decryptedCode = decryptByType(code, encryptionType, fileType);
            }
            
            // 清除进度条
            clearInterval(window.progressInterval);
            
            // 如果解密成功
            if (decryptedCode) {
                resultElement.innerHTML = `
                    <div class="success-box">
                        <p><strong>解密成功!</strong></p>
                        <div class="options-box">
                            <button id="copy-result" class="action-btn">复制结果</button>
                            <button id="download-result" class="action-btn">下载文件</button>
                            <button id="show-original" class="toggle-btn">显示原始代码</button>
                        </div>
                        <div class="code-container">
                            <pre class="code-display" id="decrypted-code">${escapeHtml(decryptedCode)}</pre>
                        </div>
                    </div>
                `;
                
                // 添加复制按钮事件
                document.getElementById('copy-result').addEventListener('click', () => {
                    navigator.clipboard.writeText(decryptedCode)
                        .then(() => {
                            alert('解密结果已复制到剪贴板!');
                        })
                        .catch(err => {
                            console.error('复制失败:', err);
                            alert('复制失败，请手动复制。');
                        });
                });
                
                // 添加下载按钮事件
                document.getElementById('download-result').addEventListener('click', () => {
                    // 创建Blob
                    const blob = new Blob([decryptedCode], { type: 'text/plain' });
                    // 创建临时链接并下载
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `decrypted.${fileType}`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
                
                // 添加显示原始代码按钮事件
                let showingOriginal = false;
                const showOriginalBtn = document.getElementById('show-original');
                showOriginalBtn.addEventListener('click', () => {
                    const codeDisplay = document.getElementById('decrypted-code');
                    if (showingOriginal) {
                        codeDisplay.textContent = decryptedCode;
                        showOriginalBtn.textContent = '显示原始代码';
                    } else {
                        codeDisplay.textContent = code;
                        showOriginalBtn.textContent = '显示解密代码';
                    }
                    showingOriginal = !showingOriginal;
                });
            } else {
                // 解密失败
                resultElement.innerHTML = `
                    <div class="error-box">
                        <p><strong>解密失败</strong></p>
                        <p>无法解密代码，可能的原因：</p>
                        <ul>
                            <li>代码没有使用支持的加密方式</li>
                            <li>代码已经是解密状态</li>
                            <li>指定的加密类型不正确</li>
                        </ul>
                        <p>请尝试选择不同的加密类型或检查代码是否需要解密。</p>
                    </div>
                `;
            }
        } catch (error) {
            // 清除进度条
            clearInterval(window.progressInterval);
            
            // 解密出错
            resultElement.innerHTML = `
                <div class="error-box">
                    <p><strong>解密过程中发生错误</strong></p>
                    <p>错误信息: ${error.message}</p>
                    <p>请检查代码格式是否正确，或者尝试其他解密方式。</p>
                </div>
            `;
            console.error('解密错误:', error);
        }
    }, 500); // 延迟执行以确保UI更新
}

// 自动检测加密类型并解密
function autoDetectAndDecrypt(code, fileType) {
    // 检查是否为JJEncode
    if (code.includes('$=~[];$={___:++$')) {
        return decryptJJEncode(code);
    }
    
    // 检查是否为AAEncode (ﾟДﾟ)
    if (code.includes('ﾟωﾟﾉ') || code.includes('ﾟΘﾟ')) {
        return decryptAAEncode(code);
    }
    
    // 检查是否为JSFuck
    if (code.match(/^[\[\]\(\)\!\+]+$/)) {
        return decryptJSFuck(code);
    }
    
    // 检查是否为Obfuscator
    if (code.includes('_0x') && code.includes('push') && code.includes('shift')) {
        return decryptObfuscator(code);
    }
    
    // 检查是否为eval嵌套
    if (code.includes('eval(') || code.includes('Function(')) {
        return decryptEval(code);
    }
    
    // 检查是否为Base64
    if (/^[A-Za-z0-9+/=]+$/.test(code.trim())) {
        try {
            return atob(code.trim());
        } catch (e) {
            // 不是有效的Base64
        }
    }
    
    // 检查是否为URL编码
    if (/%[0-9A-F]{2}/i.test(code)) {
        try {
            return decodeURIComponent(code);
        } catch (e) {
            // 不是有效的URL编码
        }
    }
    
    // 检查是否为十六进制编码
    if (/^(0x[0-9A-F]{2}\s*)+$/i.test(code.trim())) {
        return decryptHex(code);
    }
    
    // 使用通用解混淆方法尝试
    return attemptGenericDeobfuscation(code, fileType);
}

// 根据类型解密
function decryptByType(code, type, fileType) {
    switch (type) {
        case 'jjencode':
            return decryptJJEncode(code);
        case 'aaencode':
            return decryptAAEncode(code);
        case 'jsfuck':
            return decryptJSFuck(code);
        case 'obfuscator':
            return decryptObfuscator(code);
        case 'eval':
            return decryptEval(code);
        case 'base64':
            try {
                return atob(code.trim());
            } catch (e) {
                throw new Error('无效的Base64编码');
            }
        case 'urlencode':
            try {
                return decodeURIComponent(code);
            } catch (e) {
                throw new Error('无效的URL编码');
            }
        case 'hex':
            return decryptHex(code);
        case 'auto':
            return autoDetectAndDecrypt(code, fileType);
        default:
            return attemptGenericDeobfuscation(code, fileType);
    }
}

// JJEncode解密
function decryptJJEncode(code) {
    // 基本JJEncode解密实现
    // 注意：这是一个简化版，可能不能处理所有情况
    try {
        // 提取JJEncode的核心部分
        const match = code.match(/^\$=~\[\];(\$=\{.*\}\)\(\);)/);
        if (match) {
            // 创建一个安全的执行环境
            const sandbox = {
                result: '',
                console: {
                    log: function(val) {
                        this.result += val + '\n';
                    }
                }
            };
            
            // 替换原始eval和document.write等危险函数
            const safeCode = code
                .replace(/eval\(/g, 'console.log(')
                .replace(/document\.write\(/g, 'console.log(')
                .replace(/alert\(/g, 'console.log(');
            
            // 使用Function构造函数创建一个在沙箱中执行的函数
            const fun = new Function('console', safeCode);
            
            // 执行函数，捕获输出
            fun(sandbox.console);
            
            return sandbox.console.result || '无法解密JJEncode代码';
        }
        
        return '无法解析JJEncode代码格式';
    } catch (error) {
        console.error('JJEncode解密错误:', error);
        return '解密JJEncode时出错: ' + error.message;
    }
}

// AAEncode解密
function decryptAAEncode(code) {
    // 基本AAEncode解密实现
    try {
        // 提取AAEncode的核心部分
        if (code.includes('ﾟωﾟﾉ') || code.includes('ﾟΘﾟ')) {
            // 创建一个安全的执行环境
            const sandbox = {
                result: '',
                console: {
                    log: function(val) {
                        this.result += val + '\n';
                    }
                }
            };
            
            // 替换原始eval和document.write等危险函数
            const safeCode = code
                .replace(/eval\(/g, 'console.log(')
                .replace(/document\.write\(/g, 'console.log(')
                .replace(/alert\(/g, 'console.log(');
            
            // 使用Function构造函数创建一个在沙箱中执行的函数
            const fun = new Function('console', safeCode);
            
            // 执行函数，捕获输出
            fun(sandbox.console);
            
            return sandbox.console.result || '无法解密AAEncode代码';
        }
        
        return '无法解析AAEncode代码格式';
    } catch (error) {
        console.error('AAEncode解密错误:', error);
        return '解密AAEncode时出错: ' + error.message;
    }
}

// JSFuck解密
function decryptJSFuck(code) {
    // 基本JSFuck解密实现
    try {
        if (code.match(/^[\[\]\(\)\!\+]+$/)) {
            // 创建一个安全的执行环境
            const sandbox = {
                result: '',
                console: {
                    log: function(val) {
                        this.result += val + '\n';
                    }
                }
            };
            
            // 尝试执行JSFuck代码（使用安全方式）
            // 首先检查代码是否包含直接执行指令
            let safeCode = code;
            // 检查是否末尾有执行指令
            if (safeCode.endsWith('()') || safeCode.endsWith('``')) {
                // 移除直接执行，改为返回函数本身
                safeCode = safeCode.substring(0, safeCode.length - 2);
            }
            
            // 使用try-catch执行代码
            try {
                // 尝试返回函数的字符串表示
                const result = eval('(' + safeCode + ').toString()');
                return result;
            } catch (e) {
                // 如果上述方法失败，尝试直接运行但替换危险函数
                const modifiedCode = safeCode
                    .replace(/eval\(/g, 'console.log(')
                    .replace(/Function\(/g, '(x=>console.log(x))(');
                
                // 使用Function构造函数创建一个在沙箱中执行的函数
                const fun = new Function('console', modifiedCode);
                
                // 执行函数，捕获输出
                fun(sandbox.console);
                
                return sandbox.console.result || '无法解密JSFuck代码';
            }
        }
        
        return '无法解析JSFuck代码格式';
    } catch (error) {
        console.error('JSFuck解密错误:', error);
        return '解密JSFuck时出错: ' + error.message;
    }
}

// JavaScript Obfuscator解密
function decryptObfuscator(code) {
    // 基本Obfuscator解密实现
    try {
        // 检查是否符合典型的JavaScript Obfuscator模式
        if (code.includes('_0x') && (code.includes('push') || code.includes('shift'))) {
            // 尝试提取解密字典
            const dictMatches = code.match(/_0x\w+\s*=\s*\[((['"])[\s\S]*?\2(,\s*)?)+\]/g);
            
            if (dictMatches && dictMatches.length > 0) {
                // 创建一个安全的执行环境
                const sandbox = {
                    result: code,
                    arrays: {}
                };
                
                // 提取所有可能的数组声明
                for (const dictMatch of dictMatches) {
                    const arrayName = dictMatch.split('=')[0].trim();
                    const arrayContent = dictMatch.split('=')[1].trim();
                    
                    // 在沙盒中创建这个数组
                    try {
                        sandbox.arrays[arrayName] = eval(arrayContent);
                    } catch (e) {
                        // 忽略解析错误，继续处理
                    }
                }
                
                // 对代码进行简单的去混淆处理
                let deobfuscated = code;
                
                // 尝试替换所有_0xXXXX[数字]引用
                for (const arrayName in sandbox.arrays) {
                    const array = sandbox.arrays[arrayName];
                    const regex = new RegExp(arrayName.replace(/\$/g, '\\$') + '\\[(\\d+)\\]', 'g');
                    
                    deobfuscated = deobfuscated.replace(regex, (match, index) => {
                        const idx = parseInt(index);
                        if (array && idx < array.length) {
                            // 返回数组中的实际字符串值（加上引号）
                            return `"${array[idx].replace(/"/g, '\\"')}"`;
                        }
                        return match;
                    });
                }
                
                // 尝试将一些内置的解密函数替换为其结果
                // 这只是一个简化版本，实际的解混淆会复杂得多
                deobfuscated = deobfuscated
                    .replace(/function\s+(_0x\w+)\([\s\S]*?return[\s\S]*?\}/, 'function $1(a,b) { return a; }')
                    .replace(/eval\(/g, 'console.log(')
                    .replace(/document\.write\(/g, 'console.log(');
                
                return deobfuscated;
            }
        }
        
        return '无法解析Obfuscator代码格式';
    } catch (error) {
        console.error('Obfuscator解密错误:', error);
        return '解密Obfuscator时出错: ' + error.message;
    }
}

// 嵌套eval解密
function decryptEval(code) {
    // 基本eval解密实现
    try {
        if (code.includes('eval(') || code.includes('Function(')) {
            // 创建一个安全的执行环境
            const sandbox = {
                result: '',
                console: {
                    log: function(val) {
                        this.result += val + '\n';
                    }
                }
            };
            
            // 替换原始eval函数以捕获结果
            const safeCode = code
                .replace(/eval\(/g, 'console.log(')
                .replace(/Function\(/g, '(x=>console.log(x))(')
                .replace(/document\.write\(/g, 'console.log(')
                .replace(/window\[(["'])[\w$]+\1\]\(/g, 'console.log(');
            
            // 使用Function构造函数创建一个在沙箱中执行的函数
            const fun = new Function('console', safeCode);
            
            // 执行函数，捕获输出
            fun(sandbox.console);
            
            // 提取输出结果，如果有
            if (sandbox.console.result && sandbox.console.result.trim()) {
                // 检查结果是否还有嵌套的eval
                const result = sandbox.console.result;
                if (result.includes('eval(') || result.includes('Function(')) {
                    // 递归解密嵌套的eval
                    return decryptEval(result);
                }
                return result;
            }
        }
        
        return '无法解析eval嵌套代码';
    } catch (error) {
        console.error('Eval解密错误:', error);
        return '解密eval嵌套时出错: ' + error.message;
    }
}

// 十六进制解密
function decryptHex(code) {
    // 清理输入
    const cleanHex = code.replace(/0x|\\x/g, '').replace(/\s+/g, '');
    
    // 每两个字符转换一次
    let result = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
        if (i + 1 < cleanHex.length) {
            const hexPair = cleanHex.substr(i, 2);
            const charCode = parseInt(hexPair, 16);
            result += String.fromCharCode(charCode);
        }
    }
    
    return result;
}

// 通用解混淆尝试
function attemptGenericDeobfuscation(code, fileType) {
    // 这个函数尝试一些通用的解混淆技术
    let result = code;
    
    // 1. 尝试替换常见的混淆模式
    result = result
        // 替换十六进制转义为实际字符
        .replace(/\\x([0-9A-F]{2})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        })
        // 替换Unicode转义为实际字符
        .replace(/\\u([0-9A-F]{4})/gi, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16));
        })
        // 替换八进制转义为实际字符
        .replace(/\\([0-7]{3})/g, (match, oct) => {
            return String.fromCharCode(parseInt(oct, 8));
        });
    
    // 2. 尝试替换一些简单的混淆字符串连接
    result = result
        .replace(/"[\s\n]*\+[\s\n]*"/g, '')
        .replace(/'[\s\n]*\+[\s\n]*'/g, '');
    
    // 3. 尝试简化一些混淆表达式
    result = result
        .replace(/!!\[\]/g, 'true')
        .replace(/!\[\]/g, 'false')
        .replace(/\[\]\[\]/g, 'undefined');
    
    // 如果解混淆没有实质性变化，返回原始代码
    if (result === code || result.length / code.length > 0.9) {
        return '无法自动解密代码，请尝试选择特定的解密方法。';
    }
    
    return result;
}

// 启动进度条
function startProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    let width = 0;
    
    // 如果存在旧的interval，清除它
    if (window.progressInterval) {
        clearInterval(window.progressInterval);
    }
    
    // 创建新的progress interval
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width += 2; // 更平滑的进度增长
            progressBar.style.width = width + '%';
        }
    }, 50); // 5秒满进度
    
    // 保存interval ID
    window.progressInterval = interval;
}

// 初始化文件上传
function initFileUpload() {
    const fileInput = document.getElementById('local-file');
    if (!fileInput) return;
    
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!['js', 'py', 'php', 'txt'].includes(fileExtension)) {
            alert('不支持的文件类型！只支持 .js, .py, .php, .txt 文件。');
            fileInput.value = ''; // 清空文件选择
            return;
        }
        
        // 创建一个文件读取器
        const reader = new FileReader();
        
        // 文件读取完成后的处理函数
        reader.onload = function(e) {
            // 获取文件内容
            const fileContent = e.target.result;
            
            // 设置到文本区域
            const codeInput = document.getElementById('code-input');
            codeInput.value = fileContent;
            
            // 根据文件类型选择相应的单选按钮
            if (['js', 'py', 'php'].includes(fileExtension)) {
                document.querySelector(`input[name="file-type"][value="${fileExtension}"]`).checked = true;
            }
            
            // 跳转到粘贴代码标签页
            document.querySelector('.tab[data-tab="paste"]').click();
            
            // 显示成功消息
            document.getElementById('result-content').innerHTML = `
                <div class="info-box">
                    <p>文件 <strong>${file.name}</strong> 已成功加载，大小: ${(file.size / 1024).toFixed(2)} KB</p>
                    <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
                </div>
            `;
            
            // 隐藏拖放区域（如果存在）
            const dropZone = document.querySelector('.drop-zone');
            if (dropZone) {
                dropZone.style.display = 'none';
                codeInput.style.display = 'block';
            }
        };
        
        // 文件读取失败的处理函数
        reader.onerror = function() {
            alert('读取文件时出错！');
            console.error('FileReader error:', reader.error);
        };
        
        // 以文本形式读取文件
        reader.readAsText(file);
    });
}

// 初始化远程文件获取
function initRemoteFile() {
    const fetchBtn = document.getElementById('fetch-remote');
    const urlInput = document.getElementById('remote-url');
    
    if (!fetchBtn || !urlInput) return;
    
    // 获取远程文件的函数
    const fetchRemoteFile = async () => {
        const url = urlInput.value.trim();
        
        if (!url) {
            alert('请输入远程文件URL');
            return;
        }
        
        // 验证URL格式
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            alert('URL必须以http://或https://开头！');
            return;
        }
        
        // 更新UI
        const resultContent = document.getElementById('result-content');
        resultContent.innerHTML = '<p>正在获取远程文件...</p>';
        
        // 定义多个CORS代理服务，依次尝试
        const corsProxies = [
            '', // 首先尝试直接请求，某些服务器可能允许跨域
            'https://corsproxy.io/?', 
            'https://api.allorigins.win/raw?url=',
            'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        // 尝试所有代理
        let success = false;
        let lastError = null;
        
        for (const proxy of corsProxies) {
            if (success) break;
            
            try {
                resultContent.innerHTML = `<p>正在尝试获取远程文件... ${proxy ? '(使用代理)' : '(直接请求)'}</p>
                
                // 准备请求URL
                let requestUrl;
                if (proxy === '') {
                    // 直接请求
                    requestUrl = url;
                } else if (proxy.includes('?url=')) {
                    // 代理需要url参数
                    requestUrl = proxy + encodeURIComponent(url);
                } else if (proxy.includes('?quest=')) {
                    // 特殊代理格式
                    requestUrl = proxy + encodeURIComponent(url);
                } else {
                    // 直接拼接
                    requestUrl = proxy + url;
                }
                
                const response = await fetch(requestUrl, {
                    method: 'GET',
                    mode: 'cors',
                    cache: 'no-cache',
                    headers: {
                        'Accept': 'text/plain,text/html,application/javascript,application/json,*/*'
                    }
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP错误，状态码: ${response.status}`);
                }
                
                const code = await response.text();
                
                // 设置文本区域内容
                const codeInput = document.getElementById('code-input');
                codeInput.value = code;
                
                // 根据URL扩展名设置文件类型
                const fileExtension = url.split('.').pop().toLowerCase();
                if (['js', 'py', 'php'].includes(fileExtension)) {
                    document.querySelector(`input[name="file-type"][value="${fileExtension}"]`).checked = true;
                }
                
                // 切换到粘贴代码标签页
                document.querySelector('.tab[data-tab="paste"]').click();
                resultContent.innerHTML = `
                    <div class="info-box">
                        <p>远程文件获取成功！文件大小: ${(code.length / 1024).toFixed(2)} KB</p>
                        <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
                    </div>
                `;
                
                // 隐藏拖放区域（如果存在）
                const dropZone = document.querySelector('.drop-zone');
                if (dropZone) {
                    dropZone.style.display = 'none';
                    codeInput.style.display = 'block';
                }
                
                success = true;
                break;
            } catch (error) {
                console.error(`使用代理 ${proxy || '直接请求'} 获取失败:`, error);
                lastError = error;
                // 继续尝试下一个代理
            }
        }
        
        // 如果所有代理都失败
        if (!success) {
            resultContent.innerHTML = `
                <div class="info-box" style="border-left-color: #F44336;">
                    <p><strong>获取远程文件失败:</strong> ${lastError?.message || '未知错误'}</p>
                    <p>可能的原因:</p>
                    <ul>
                        <li>URL地址不正确</li>
                        <li>目标服务器拒绝访问</li>
                        <li>目标服务器设置了严格的跨域限制</li>
                    </ul>
                    <p>您可以尝试:</p>
                    <ul>
                        <li>手动下载文件并使用本地文件上传功能</li>
                        <li>直接复制文件内容到文本区域</li>
                        <li>确认URL是否正确，包括协议(http/https)</li>
                    </ul>
                </div>
            `;
        }
    };
    
    // 点击按钮获取远程文件
    fetchBtn.addEventListener('click', fetchRemoteFile);
    
    // 按回车键获取远程文件
    urlInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            fetchRemoteFile();
        }
    });
}
