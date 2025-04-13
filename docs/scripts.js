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
            
            // 创建GitHub issue
            createGitHubIssue(code, fileType, encryptionType);
        });
    }
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
                
                <div class="auth-inputs">
                    <input type="text" id="github-username" class="auth-input" placeholder="您的GitHub用户名（可选）">
                    <input type="password" id="github-token" class="auth-input" placeholder="个人访问令牌（可选）">
                </div>
                <p style="font-size: 12px; color: #999;">注意：提供GitHub令牌可以自动创建Issue。如不提供，将引导您手动创建。您的令牌不会被保存。</p>
                
                <div class="action-buttons">
                    <button id="create-issue-btn" class="primary-btn">创建解密请求</button>
                    <button id="show-manual-btn" class="secondary-btn">手动步骤</button>
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

// 修改showManualSteps函数，添加浮动复制按钮
function showManualSteps(issueTitle, issueBody, fileType) {
    const resultElement = document.getElementById('result-content');
    
    resultElement.innerHTML = `
        <p>请按照以下步骤创建解密请求：</p>
        <ol>
            <li>手动创建一个新Issue: <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new" target="_blank" class="github-link">创建Issue</a></li>
            <li>使用标题: <strong>${issueTitle}</strong></li>
            <li>在内容中粘贴以下模板:</li>
        </ol>
        <div class="code-template">
            <pre>${escapeHtml(issueBody)}</pre>
            <button id="copy-template-btn" class="secondary-btn" style="margin-top: 10px;">复制模板</button>
        </div>
        <ol start="4">
            <li>提交Issue后回到此页面，点击下方按钮输入Issue编号</li>
        </ol>
        <button id="check-result-btn" class="primary-btn" style="display: block; margin: 15px auto; padding: 10px 20px; font-size: 16px;">输入Issue编号</button>
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
    
    // 添加浮动复制按钮
    const floatingBtn = document.createElement('button');
    floatingBtn.textContent = '快速复制模板';
    floatingBtn.style.cssText = 'position:fixed; bottom:20px; right:20px; padding:10px 15px; background:#9eca34; color:white; border:none; border-radius:6px; cursor:pointer; z-index:9999; box-shadow:0 2px 5px rgba(0,0,0,0.2);';
    
    floatingBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(issueBody)
            .then(() => {
                alert('模板已复制到剪贴板！现在您可以粘贴到Issue中。');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制模板。');
            });
    });
    
    document.body.appendChild(floatingBtn);
    
    // 在用户离开或点击检查结果按钮时移除浮动按钮
    const cleanupFloatingBtn = () => {
        if (document.body.contains(floatingBtn)) {
            document.body.removeChild(floatingBtn);
        }
    };
    
    document.getElementById('check-result-btn').addEventListener('click', cleanupFloatingBtn);
    
    // 当用户离开结果区域或导航到其他页面时移除浮动按钮
    window.addEventListener('beforeunload', cleanupFloatingBtn);
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', cleanupFloatingBtn);
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

// 初始化拖放功能
function initDragDrop() {
    // 获取代码输入区域
    const codeInput = document.getElementById('code-input');
    if (!codeInput) return;
    
    // 准备拖放区域
    const pasteContent = document.getElementById('paste-content');
    if (!pasteContent) return;
    
    // 检查是否已经存在拖放区域
    let dropZone = document.querySelector('.drop-zone');
    
    // 如果没有拖放区域，创建一个
    if (!dropZone) {
        dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <div class="drop-message">
                <i class="drop-icon">📄</i>
                <p>拖放文件到这里</p>
                <p class="drop-sub">或点击此处选择文件</p>
            </div>
        `;
        
        // 只有在代码输入为空时才显示拖放区域
        if (!codeInput.value.trim()) {
            codeInput.style.display = 'none';
            // 在代码输入区域前插入拖放区域
            pasteContent.insertBefore(dropZone, codeInput);
        }
    }
    
    // 添加隐藏的文件输入
    let hiddenFileInput = document.getElementById('hidden-file-input');
    if (!hiddenFileInput) {
        hiddenFileInput = document.createElement('input');
        hiddenFileInput.type = 'file';
        hiddenFileInput.id = 'hidden-file-input';
        hiddenFileInput.style.display = 'none';
        hiddenFileInput.accept = '.js,.py,.php,.txt';
        document.body.appendChild(hiddenFileInput);
    }
    
    // 点击拖放区域打开文件选择器
    dropZone.addEventListener('click', () => {
        hiddenFileInput.click();
    });
    
    // 处理文件选择
    hiddenFileInput.addEventListener('change', (event) => {
        if (event.target.files.length) {
            handleFileUpload(event.target.files[0]);
        }
    });
    
    // 拖放区域的事件处理
    dropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.add('active');
    });
    
    dropZone.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('active');
    });
    
    dropZone.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        dropZone.classList.remove('active');
        
        if (event.dataTransfer.files.length) {
            handleFileUpload(event.dataTransfer.files[0]);
        }
    });
    
    // 直接拖放到文本区域
    codeInput.addEventListener('dragover', (event) => {
        event.preventDefault();
        event.stopPropagation();
        codeInput.style.borderColor = '#9eca34';
    });
    
    codeInput.addEventListener('dragleave', (event) => {
        event.preventDefault();
        event.stopPropagation();
        codeInput.style.borderColor = '';
    });
    
    codeInput.addEventListener('drop', (event) => {
        event.preventDefault();
        event.stopPropagation();
        codeInput.style.borderColor = '';
        
        if (event.dataTransfer.files.length) {
            handleFileUpload(event.dataTransfer.files[0]);
        }
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
