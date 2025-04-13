// scripts-modified.js
// 从原有scripts.js修改而来，移除GitHub依赖，添加浏览器端解密功能

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 动态加载解密库
    loadDeobfuscatorLib();
    
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

// 动态加载解密库
function loadDeobfuscatorLib() {
    const script = document.createElement('script');
    script.src = 'browser-deobfuscator.js';
    script.onload = function() {
        console.log('解密库加载成功');
    };
    script.onerror = function() {
        console.error('解密库加载失败');
        alert('解密库加载失败，请确保browser-deobfuscator.js文件存在于服务器上');
    };
    document.head.appendChild(script);
}

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
}

// 统一处理文件上传
function handleFileUpload(file) {
    if (!file) return;
    
    // 检查文件类型
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['js', 'py', 'php', 'txt'].includes(fileExtension)) {
        alert('不支持的文件类型！只支持 .js, .py, .php, .txt 文件。');
        return;
    }
    
    // 创建文件读取器
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // 获取文件内容
        const fileContent = e.target.result;
        
        // 设置文本区域内容
        const codeInput = document.getElementById('code-input');
        codeInput.value = fileContent;
        codeInput.style.display = 'block';
        
        // 隐藏拖放区域（如果存在）
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone) {
            dropZone.style.display = 'none';
        }
        
        // 根据文件类型选择相应的单选按钮
        if (['js', 'py', 'php'].includes(fileExtension)) {
            document.querySelector(`input[name="file-type"][value="${fileExtension}"]`).checked = true;
        }
        
        // 显示成功消息
        document.getElementById('result-content').innerHTML = `
            <div class="info-box">
                <p>文件 <strong>${file.name}</strong> 已成功加载，大小: ${(file.size / 1024).toFixed(2)} KB</p>
                <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
            </div>
        `;
        
        // 跳转到粘贴代码标签页
        document.querySelector('.tab[data-tab="paste"]').click();
    };
    
    reader.onerror = function() {
        alert('读取文件时出错！');
        console.error('FileReader error:', reader.error);
    };
    
    // 以文本形式读取文件
    reader.readAsText(file);
}

// HTML转义防止XSS
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
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
    
    // 解码按钮点击事件 - 修改为使用本地解密
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
            
            // 使用浏览器端解密
            performLocalDeobfuscation(code, fileType, encryptionType);
        });
    }
}

// 执行本地解密
function performLocalDeobfuscation(code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    // 显示处理中的状态
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
    
    // 延迟执行以允许UI更新并显示进度条
    setTimeout(() => {
        try {
            // 检查解密库是否已加载
            if (!window.browserDeobfuscator) {
                throw new Error('解密库尚未加载，请刷新页面重试');
            }
            
            let deobfuscatedCode;
            
            // 根据加密类型选择相应的解密方法
            switch (encryptionType) {
                case 'auto':
                    deobfuscatedCode = window.browserDeobfuscator.autoDetectAndDeobfuscate(code);
                    break;
                case 'common':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateCommon(code);
                    break;
                case 'jjencode':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateJJEncode(code);
                    break;
                case 'sojson':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateSojson(code);
                    break;
                case 'sojsonv7':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateSojsonV7(code);
                    break;
                case 'obfuscator':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateJSObfuscator(code);
                    break;
                case 'awsc':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateAwsc(code);
                    break;
                case 'part2ai':
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscatePart2AI(code);
                    break;
                default:
                    deobfuscatedCode = window.browserDeobfuscator.deobfuscateCommon(code);
            }
            
            // 清除进度条interval
            clearInterval(window.progressInterval);
            
            // 显示结果
            resultElement.innerHTML = `
                <div class="info-box" style="border-left-color: #9eca34;">
                    <p><strong>解密成功！</strong></p>
                    <p>解密类型: <code>${encryptionType}</code></p>
                    <p>文件类型: <code>${fileType}</code></p>
                </div>
                <div class="code-result">
                    <pre><code id="deobfuscated-code">${escapeHtml(deobfuscatedCode)}</code></pre>
                    <div class="action-buttons">
                        <button id="copy-result-btn" class="primary-btn">复制结果</button>
                        <button id="download-result-btn" class="secondary-btn">下载文件</button>
                    </div>
                </div>
            `;
            
            // 添加复制按钮事件
            document.getElementById('copy-result-btn').addEventListener('click', () => {
                const codeElement = document.getElementById('deobfuscated-code');
                
                navigator.clipboard.writeText(deobfuscatedCode)
                    .then(() => {
                        alert('解密结果已复制到剪贴板！');
                    })
                    .catch(err => {
                        console.error('复制失败:', err);
                        alert('复制失败，请手动复制结果。');
                    });
            });
            
            // 添加下载按钮事件
            document.getElementById('download-result-btn').addEventListener('click', () => {
                // 创建Blob对象
                const blob = new Blob([deobfuscatedCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                
                // 创建下载链接
                const a = document.createElement('a');
                a.href = url;
                a.download = `deobfuscated.${fileType}`;
                document.body.appendChild(a);
                a.click();
                
                // 清理
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
            });
            
        } catch (error) {
            console.error('解密错误:', error);
            
            // 清除进度条interval
            clearInterval(window.progressInterval);
            
            // 显示错误消息
            resultElement.innerHTML = `
                <div class="info-box" style="border-left-color: #F44336;">
                    <p><strong>解密失败:</strong> ${error.message || '未知错误'}</p>
                    <p>可能的原因:</p>
                    <ul>
                        <li>选择的解密类型与代码不匹配</li>
                        <li>代码格式不正确或已损坏</li>
                        <li>混淆类型过于复杂，无法在浏览器中解密</li>
                    </ul>
                    <p>建议:</p>
                    <ul>
                        <li>尝试使用"自动检测"选项</li>
                        <li>检查代码是否完整</li>
                        <li>尝试不同的解密类型</li>
                    </ul>
                </div>
            `;
        }
    }, 500); // 延迟500ms执行，让UI有时间更新
}

// 启动进度条
function startProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (!progressBar) return;
    
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
            width += 5; // 更快的进度增长，因为是本地处理
            progressBar.style.width = width + '%';
        }
    }, 50); // 更短的间隔
    
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
                resultContent.innerHTML = `<p>正在尝试获取远程文件... ${proxy ? '(使用代理)' : '(直接请求)'}</p>`;
                
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
