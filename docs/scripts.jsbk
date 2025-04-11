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
        // 提供手动创建Issue的指南
        resultElement.innerHTML = `
            <p>请按照以下步骤创建解密请求：</p>
            <ol>
                <li>手动创建一个新Issue: <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new" target="_blank" class="github-link">创建Issue</a></li>
                <li>使用标题: <strong>[Web解密请求] ${encryptionType}</strong></li>
                <li>在内容中添加以下模板:</li>
            </ol>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 4px; margin: 15px 0; border: 1px solid #333;">
                <pre style="margin: 0; white-space: pre-wrap; word-break: break-all;">
# 解密请求

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**时间戳:** ${new Date().toISOString()}

**代码:**
\`\`\`${fileType}
${code.length > 500 ? '(请在这里粘贴您的完整代码)' : code}
\`\`\`</pre>
                <button id="copy-template-btn" style="margin-top: 10px; background-color: #333; color: #e0e0e0; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">复制模板</button>
            </div>
            <ol start="4">
                <li>提交Issue后回到此页面，点击下方按钮输入Issue编号</li>
            </ol>
            <button id="check-result-btn" class="github-link" style="display: block; margin: 15px auto; padding: 10px 20px; font-size: 16px;">输入Issue编号</button>
        `;
        
        // 添加复制模板按钮事件
        document.getElementById('copy-template-btn').addEventListener('click', () => {
            const templateText = `# 解密请求

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**时间戳:** ${new Date().toISOString()}

**代码:**
\`\`\`${fileType}
${code}
\`\`\``;
            
            navigator.clipboard.writeText(templateText)
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
    } catch (error) {
        resultElement.innerHTML = `
            <p>错误: ${error.message}</p>
            <p>请稍后重试。</p>
        `;
    }
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
    document.getElementById('local-file')?.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('code-input').value = e.target.result;
                
                // 根据文件扩展名设置文件类型
                const fileExtension = file.name.split('.').pop().toLowerCase();
                document.querySelectorAll('input[name="file-type"]').forEach(input => {
                    if (input.value === fileExtension) {
                        input.checked = true;
                    }
                });
                
                // 切换到粘贴代码标签页
                document.querySelectorAll('.tab')[0].click();
            };
            reader.readAsText(file);
        }
    });
}

// 初始化远程文件获取
function initRemoteFile() {
    document.getElementById('fetch-remote')?.addEventListener('click', () => {
        const url = document.getElementById('remote-url')?.value;
        if (!url) {
            alert('请输入远程文件URL');
            return;
        }
        
        // 更新UI
        document.getElementById('result-content').innerHTML = '<p>正在获取远程文件...</p>';
        
        // 尝试通过CORS代理获取远程文件
        // 注意：cors-anywhere可能对新域名有限制
        // 考虑使用其他公共CORS代理或自建代理
        const corsProxy = 'https://cors-anywhere.herokuapp.com/';
        fetch(corsProxy + url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('无法获取远程文件');
                }
                return response.text();
            })
            .then(code => {
                // 设置文本区域内容
                document.getElementById('code-input').value = code;
                
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
                document.getElementById('result-content').innerHTML = '<p>远程文件获取成功，已填充到文本框</p>';
            })
            .catch(error => {
                document.getElementById('result-content').innerHTML = `
                    <p>获取远程文件失败: ${error.message}</p>
                    <p>由于浏览器的安全限制，某些远程文件可能无法直接获取。请尝试手动复制代码。</p>
                    <p>或者尝试使用其他公共CORS代理：</p>
                    <ul>
                        <li><a href="https://allorigins.win/" target="_blank" class="github-link">AllOrigins</a></li>
                        <li><a href="https://api.codetabs.com/v1/proxy" target="_blank" class="github-link">CodeTabs Proxy</a></li>
                    </ul>
                `;
            });
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
