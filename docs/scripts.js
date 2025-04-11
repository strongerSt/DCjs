// scripts.js
// GitHub仓库配置
const repoConfig = {
    owner: 'Mikephie',
    repo: 'DCjs',
    branch: 'main'
};

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
    document.getElementById('clear-btn')?.addEventListener('click', () => {
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
    
    // 解码按钮点击事件
    document.getElementById('decrypt-btn')?.addEventListener('click', () => {
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
        
        // 创建GitHub issue
        createGitHubIssue(code, fileType, encryptionType);
    });
}

// 创建GitHub issue
function createGitHubIssue(code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    try {
        // 构造Issue标题和内容
        const issueTitle = `[Web解密请求] ${encryptionType}`;
        const issueBody = `# 解密请求

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**时间戳:** ${new Date().toISOString()}

**代码:**
\`\`\`${fileType}
${code}
\`\`\``;

        // 在结果区域显示一个用户友好的表单
        resultElement.innerHTML = `
            <div class="info-box">
                <p><strong>创建解密请求</strong></p>
                <p>我们将为您自动创建一个解密请求。请检查以下信息：</p>
                
                <p><strong>标题:</strong> ${issueTitle}</p>
                <p><strong>文件类型:</strong> ${fileType}</p>
                <p><strong>加密类型:</strong> ${encryptionType}</p>
                <p><strong>代码长度:</strong> ${code.length} 字符</p>
                
                <div style="margin: 15px 0;">
                    <input type="text" id="github-username" placeholder="您的GitHub用户名（可选）" style="padding: 8px; margin-right: 10px; width: 200px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
                    <input type="password" id="github-token" placeholder="个人访问令牌（可选）" style="padding: 8px; width: 200px; background: #333; color: #fff; border: 1px solid #555; border-radius: 4px;">
                </div>
            `;
        }
    });
    
    // 允许在远程URL输入框中按回车触发获取
    document.getElementById('remote-url')?.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            document.getElementById('fetch-remote')?.click();
        }
    });
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

// 添加自定义CSS样式
function addCustomStyles() {
    // 检查是否已经添加了样式
    if (document.getElementById('custom-mikephie-styles')) return;
    
    const styleElement = document.createElement('style');
    styleElement.id = 'custom-mikephie-styles';
    styleElement.textContent = `
        .progress-container {
            width: 100%;
            background-color: #333;
            border-radius: 4px;
            margin: 10px 0;
            height: 10px;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 100%;
            background-color: #9eca34;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .success-box {
            background-color: rgba(76, 175, 80, 0.1);
            border: 1px solid #4CAF50;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .error-box {
            background-color: rgba(244, 67, 54, 0.1);
            border: 1px solid #F44336;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
        }
        
        .drop-zone.highlight {
            border-color: #9eca34;
            background-color: #232323;
        }
    `;
    document.head.appendChild(styleElement);
}

// 在页面加载时添加自定义样式
document.addEventListener('DOMContentLoaded', addCustomStyles);
                <p style="font-size: 12px; color: #999;">注意：提供GitHub令牌可以自动创建Issue。如不提供，将引导您手动创建。您的令牌不会被保存。</p>
                
                <div style="display: flex; gap: 10px; margin-top: 15px;">
                    <button id="create-issue-btn" class="github-link">创建解密请求</button>
                    <button id="show-manual-btn" class="github-link" style="background: #333;">手动步骤</button>
                </div>
            </div>
        `;
        
        // 添加创建按钮事件
        document.getElementById('create-issue-btn').addEventListener('click', async () => {
            const username = document.getElementById('github-username').value.trim();
            const token = document.getElementById('github-token').value.trim();
            
            if (token && username) {
                // 如果提供了令牌，尝试自动创建Issue
                try {
                    resultElement.innerHTML = `<p>正在创建Issue...</p>`;
                    
                    // 使用GitHub API创建Issue
                    const response = await fetch(`https://api.github.com/repos/${repoConfig.owner}/${repoConfig.repo}/issues`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `token ${token}`,
                            'Accept': 'application/vnd.github.v3+json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            title: issueTitle,
                            body: issueBody
                        })
                    });
                    
                    if (response.ok) {
                        const issueData = await response.json();
                        const issueNumber = issueData.number;
                        
                        resultElement.innerHTML = `
                            <p>解密请求创建成功！Issue #${issueNumber}</p>
                            <p>GitHub Actions正在处理您的请求，请稍候...</p>
                            <div class="progress-container">
                                <div class="progress-bar" id="progress-bar"></div>
                            </div>
                            <p>您可以 <a href="${issueData.html_url}" target="_blank" class="github-link">查看Issue状态</a> 或等待结果显示在这里</p>
                        `;
                        
                        // 启动进度条
                        startProgressBar();
                        
                        // 开始轮询结果
                        pollForIssueResults(issueNumber, fileType);
                    } else {
                        const errorData = await response.json();
                        throw new Error(`GitHub API错误: ${errorData.message || '创建Issue失败'}`);
                    }
                } catch (error) {
                    console.error('创建Issue失败:', error);
                    resultElement.innerHTML = `
                        <p>自动创建Issue失败: ${error.message}</p>
                        <p>请尝试手动创建Issue。</p>
                        <button id="show-manual-steps" class="github-link">显示手动步骤</button>
                    `;
                    
                    document.getElementById('show-manual-steps').addEventListener('click', () => {
                        showManualSteps(issueTitle, issueBody, fileType);
                    });
                }
            } else {
                // 如果没有提供令牌，显示手动步骤
                showManualSteps(issueTitle, issueBody, fileType);
            }
        });
        
        // 添加手动按钮事件
        document.getElementById('show-manual-btn').addEventListener('click', () => {
            showManualSteps(issueTitle, issueBody, fileType);
        });
    } catch (error) {
        resultElement.innerHTML = `
            <p>错误: ${error.message}</p>
            <p>请稍后重试。</p>
        `;
    }
}

// 显示手动创建Issue的步骤
function showManualSteps(issueTitle, issueBody, fileType) {
    const resultElement = document.getElementById('result-content');
    
    resultElement.innerHTML = `
        <p>请按照以下步骤创建解密请求：</p>
        <ol>
            <li>手动创建一个新Issue: <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new" target="_blank" class="github-link">创建Issue</a></li>
            <li>使用标题: <strong>${issueTitle}</strong></li>
            <li>在内容中粘贴以下模板:</li>
        </ol>
        <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #333;">
            <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">${escapeHtml(issueBody)}</pre>
            <button id="copy-template-btn" style="margin-top: 10px; background-color: #333; color: #e0e0e0; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">复制模板</button>
        </div>
        <ol start="4">
            <li>提交Issue后回到此页面，点击下方按钮输入Issue编号</li>
        </ol>
        <button id="check-result-btn" class="github-link" style="display: block; margin: 15px auto; padding: 10px 20px; font-size: 16px;">输入Issue编号</button>
    `;
    
    // 添加复制模板按钮事件
    document.getElementById('copy-template-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(issueBody)
            .then(() => {
                alert('模板已复制到剪贴板！现在您可以粘贴到Issue中。');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制模板。');
            });
    });
    
    // 添加检查结果按钮事件
    document.getElementById('check-result-btn').addEventListener('click', () => {
        promptForIssueNumber(fileType);
    });
}

// 提示输入Issue编号
function promptForIssueNumber(fileType) {
    const issueNumber = prompt('请输入Issue编号 (仅数字部分):', '');
    if (issueNumber && !isNaN(issueNumber)) {
        const resultElement = document.getElementById('result-content');
        resultElement.innerHTML = `
            <p>正在检查issue #${issueNumber}的解密结果...</p>
            <p>请等待约60秒，GitHub Actions正在处理您的请求</p>
            <div class="progress-container">
                <div class="progress-bar" id="progress-bar"></div>
            </div>
        `;
        
        // 启动进度条
        startProgressBar();
        
        // 开始轮询结果
        pollForIssueResults(issueNumber, fileType);
    } else {
        alert('请输入有效的Issue编号！');
    }
}

// 轮询issue结果
function pollForIssueResults(issueNumber, fileType) {
    const resultElement = document.getElementById('result-content');
    let attempts = 0;
    const maxAttempts = 20; // 最多尝试20次，每次3秒
    
    const checkIssue = () => {
        attempts++;
        
        if (attempts > maxAttempts) {
            // 超过最大尝试次数
            clearInterval(window.progressInterval);
            resultElement.innerHTML = `
                <p>检查超时。GitHub Actions可能仍在处理您的请求。</p>
                <p>请稍后直接查看issue获取结果。</p>
                <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/${issueNumber}" target="_blank" class="github-link">查看Issue #${issueNumber}</a>
                <button id="retry-btn" class="github-link" style="margin-top: 10px;">再次检查</button>
            `;
            
            // 添加重试按钮事件
            document.getElementById('retry-btn').addEventListener('click', () => {
                pollForIssueResults(issueNumber, fileType);
            });
            return;
        }
        
        // 由于浏览器端无法直接访问GitHub API（需要认证令牌），
        // 我们会指导用户直接查看issue
        if (attempts === 10) { // 等待约30秒后提示
            resultElement.innerHTML = `
                <p>GitHub Actions可能正在处理您的请求。</p>
                <p>您可以直接查看issue获取最新结果：</p>
                <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/${issueNumber}" target="_blank" class="github-link">查看Issue #${issueNumber}</a>
                <p>或继续等待自动检查（还剩${maxAttempts - attempts}次尝试）</p>
                <div class="progress-container">
                    <div class="progress-bar" id="progress-bar" style="width: ${(attempts / maxAttempts) * 100}%"></div>
                </div>
            `;
        }
        
        // 这里我们假设解密大约需要60秒
        // 实际应用中，如果有API访问权限，可以真正检查issue评论
        if (attempts >= maxAttempts - 1) { // 最后一次尝试
            clearInterval(checkInterval);
            clearInterval(window.progressInterval);
            
            resultElement.innerHTML = `
                <p>检查完成，请点击下方链接查看解密结果：</p>
                <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/${issueNumber}" target="_blank" class="github-link">查看Issue #${issueNumber} 的解密结果</a>
                <p class="info-box" style="margin-top: 15px;">
                    <strong>提示:</strong> 如果Issue中尚未显示解密结果，GitHub Actions可能仍在处理。
                    请稍后再查看，或检查是否有错误信息。
                </p>
            `;
        }
    };
    
    // 立即执行一次
    checkIssue();
    
    // 然后每3秒执行一次
    const checkInterval = setInterval(checkIssue, 3000);
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
            width += 0.5; // 更平滑的进度增长
            progressBar.style.width = width + '%';
        }
    }, 300); // 60秒满进度
    
    // 保存interval ID
    window.progressInterval = interval;
}

// 【改进后的文件上传功能】
// 初始化文件上传
function initFileUpload() {
    // 处理本地文件上传按钮
    document.getElementById('local-file')?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileUpload(file);
        }
    });
}

// 【改进后的拖放功能】
// 初始化拖放功能
function initDragDrop() {
    // 获取文本区域元素
    const textArea = document.getElementById('code-input');
    if (!textArea) return;
    
    // 检查是否已经存在拖放区域，如果不存在才创建
    let dropZone = document.querySelector('.drop-zone');
    if (!dropZone) {
        // 创建一个拖放区域
        dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <div class="drop-message">
                <i class="drop-icon">📄</i>
                <p>拖放文件到这里</p>
                <p class="drop-sub">或点击此处选择文件</p>
            </div>
        `;
        
        // 设置样式
        dropZone.style.display = 'flex';
        dropZone.style.flexDirection = 'column';
        dropZone.style.alignItems = 'center';
        dropZone.style.justifyContent = 'center';
        dropZone.style.height = '300px';
        dropZone.style.border = '2px dashed #555';
        dropZone.style.borderRadius = '8px';
        dropZone.style.backgroundColor = '#1a1a1a';
        dropZone.style.margin = '20px 0';
        dropZone.style.cursor = 'pointer';
        
        // 插入到文本区域前面
        textArea.parentNode.insertBefore(dropZone, textArea);
        
        // 只有在文本区域为空时才隐藏它
        if (!textArea.value.trim()) {
            textArea.style.display = 'none';
        }
    }
    
    // 创建一个隐藏的文件输入
    let fileInput = document.getElementById('hidden-file-input');
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'hidden-file-input';
        fileInput.style.display = 'none';
        fileInput.accept = '.js,.py,.php,.txt';
        document.body.appendChild(fileInput);
    }
    
    // 点击拖放区域时触发文件选择
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 处理文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
    
    // 处理拖放事件
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#9eca34';
        dropZone.style.backgroundColor = '#232323';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#555';
        dropZone.style.backgroundColor = '#1a1a1a';
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.borderColor = '#555';
        dropZone.style.backgroundColor = '#1a1a1a';
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
    
    // 为文本区域也添加拖放功能
    textArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        textArea.style.borderColor = '#9eca34';
        textArea.style.backgroundColor = 'rgba(158, 202, 52, 0.05)';
    });
    
    textArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        textArea.style.borderColor = '';
        textArea.style.backgroundColor = '';
    });
    
    textArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        textArea.style.borderColor = '';
        textArea.style.backgroundColor = '';
        
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });
}

// 【改进后的文件处理统一函数】
// 统一的文件处理函数
function handleFileUpload(file) {
    const textArea = document.getElementById('code-input');
    const dropZone = document.querySelector('.drop-zone');
    const resultContent = document.getElementById('result-content');
    
    // 检查文件类型
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = ['js', 'py', 'php', 'txt'];
    
    if (!allowedExtensions.includes(fileExtension)) {
        resultContent.innerHTML = `
            <div class="error-box" style="background-color: rgba(244, 67, 54, 0.1); border: 1px solid #F44336; padding: 10px; border-radius: 4px;">
                <p>不支持的文件类型: ${fileExtension}</p>
                <p>只支持 .js, .py, .php, .txt 文件</p>
            </div>
        `;
        return;
    }
    
    // 创建FileReader对象
    const reader = new FileReader();
    
    // 当文件读取成功时触发
    reader.onload = (e) => {
        const content = e.target.result;
        
        // 设置文本区域内容
        textArea.value = content;
        textArea.style.display = 'block';
        
        // 隐藏拖放区域
        if (dropZone) {
            dropZone.style.display = 'none';
        }
        
        // 根据文件扩展名设置文件类型
        if (['js', 'py', 'php'].includes(fileExtension)) {
            document.querySelectorAll('input[name="file-type"]').forEach(input => {
                if (input.value === fileExtension) {
                    input.checked = true;
                }
            });
        }
        
        // 显示成功消息
        resultContent.innerHTML = `
            <div class="success-box" style="background-color: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; padding: 10px; border-radius: 4px;">
                <p>文件上传成功！</p>
                <p>文件名: ${file.name}</p>
                <p>文件大小: ${(file.size / 1024).toFixed(2)} KB</p>
            </div>
        `;
        
        // 切换到粘贴代码标签页（如果不在粘贴代码标签页）
        const activeTab = document.querySelector('.tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') !== 'paste') {
            document.querySelector('.tab[data-tab="paste"]').click();
        }
    };
    
    // 当文件读取失败时触发
    reader.onerror = () => {
        resultContent.innerHTML = `
            <div class="error-box" style="background-color: rgba(244, 67, 54, 0.1); border: 1px solid #F44336; padding: 10px; border-radius: 4px;">
                <p>读取文件失败!</p>
                <p>错误信息: ${reader.error}</p>
            </div>
        `;
    };
    
    // 开始读取文件
    reader.readAsText(file);
}

// 【改进后的远程文件获取功能】
// 初始化远程文件获取
function initRemoteFile() {
    document.getElementById('fetch-remote')?.addEventListener('click', async () => {
        const url = document.getElementById('remote-url')?.value.trim();
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
            'https://api.codetabs.com/v1/proxy?quest=',
            'https://cors-anywhere.herokuapp.com/'
        ];
        
        // 尝试所有代理
        let success = false;
        let lastError = null;
        
        for (const proxy of corsProxies) {
            if (success) break;
            
            try {
                resultContent.innerHTML = `<p>正在尝试获取远程文件... (${proxy ? '使用代理' : '直接请求'})</p>`;
                
                const response = await fetch(proxy + encodeURIComponent(url).replace(/^https%3A/i, 'https:').replace(/^http%3A/i, 'http:'), {
                    method: 'GET',
                    mode: 'cors',
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
                
                // 如果有拖放区，需要隐藏它并显示文本区域
                const dropZone = document.querySelector('.drop-zone');
                if (dropZone) {
                    dropZone.style.display = 'none';
                    codeInput.style.display = 'block';
                }
                
                // 根据URL扩展名设置文件类型
                const fileExtension = url.split('.').pop().toLowerCase();
                if (['js', 'py', 'php'].includes(fileExtension)) {
                    document.querySelectorAll('input[name="file-type"]').forEach(input => {
                        if (input.value === fileExtension) {
                            input.checked = true;
                        }
                    });
                }
                
                // 切换到粘贴代码标签页
                document.querySelectorAll('.tab')[0].click();
                resultContent.innerHTML = `
                    <div class="success-box" style="background-color: rgba(76, 175, 80, 0.1); border: 1px solid #4CAF50; padding: 10px; border-radius: 4px;">
                        <p>远程文件获取成功！</p>
                        <p>文件大小: ${(code.length / 1024).toFixed(2)} KB</p>
                    </div>
                `;
                
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
                <div class="error-box" style="background-color: rgba(244, 67, 54, 0.1); border: 1px solid #F44336; padding: 10px; border-radius: 4px;">
                    <p>获取远程文件失败: ${lastError?.message || '未知错误'}</p>
                    <p>所有可用的CORS代理都无法获取此文件。</p>
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
