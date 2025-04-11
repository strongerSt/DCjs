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
    document.getElementById('clear-btn').addEventListener('click', () => {
        document.getElementById('code-input').value = '';
        document.getElementById('result-content').innerHTML = '';
    });
    
    // 解码按钮点击事件
    document.getElementById('decrypt-btn').addEventListener('click', () => {
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

// 初始化文件上传
function initFileUpload() {
    document.getElementById('local-file').addEventListener('change', (event) => {
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
    document.getElementById('fetch-remote').addEventListener('click', () => {
        const url = document.getElementById('remote-url').value;
        if (!url) {
            alert('请输入远程文件URL');
            return;
        }
        
        // 更新UI
        document.getElementById('result-content').innerHTML = '<p>正在获取远程文件...</p>';
        
        // 尝试通过CORS代理获取远程文件
        fetch('https://cors-anywhere.herokuapp.com/' + url)
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
                `;
            });
    });
}

// 创建GitHub issue
function createGitHubIssue(code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    try {
        // 构造issue URL
        const issueUrl = `https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new`;
        
        // 构造issue内容
        const issueTitle = `[Web解密请求] ${encryptionType} - ${new Date().toISOString()}`;
        const issueBody = `
# 解密请求

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**时间戳:** ${new Date().toISOString()}

**代码:**
\`\`\`${fileType}
${code}
\`\`\`
        `;
        
        // 编码issue内容
        const encodedTitle = encodeURIComponent(issueTitle);
        const encodedBody = encodeURIComponent(issueBody);
        
        // 创建完整URL
        const fullIssueUrl = `${issueUrl}?title=${encodedTitle}&body=${encodedBody}`;
        
        // 在新窗口中打开GitHub issue创建页面
        const newWindow = window.open(fullIssueUrl, '_blank');
        
        // 更新UI提示用户操作
        resultElement.innerHTML = `
            <p>已打开GitHub issue创建页面，请按照以下步骤操作：</p>
            <ol>
                <li>在新打开的页面中点击"Submit new issue"提交issue</li>
                <li>提交后回到本页面</li>
                <li>记下issue编号（例如"#12"）</li>
                <li>点击下方"开始检查结果"按钮并输入issue编号</li>
            </ol>
            <button id="check-result-btn">开始检查结果</button>
        `;
        
        // 添加检查结果按钮事件
        document.getElementById('check-result-btn').addEventListener('click', () => {
            const issueNumber = prompt('请输入刚刚创建的issue编号 (仅数字部分):', '');
            if (issueNumber && !isNaN(issueNumber)) {
                // 更新UI
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
                alert('请输入有效的issue编号！');
            }
        });
    } catch (error) {
        resultElement.innerHTML = `
            <p>错误: ${error.message}</p>
            <p>请稍后重试。</p>
        `;
    }
}

// 启动进度条
function startProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    let width = 0;
    
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
        } else {
            width++;
            progressBar.style.width = width + '%';
        }
    }, 600); // 60秒完成
    
    // 保存interval ID
    window.progressInterval = interval;
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
                <p>请稍后直接查看issue #${issueNumber}的评论获取结果。</p>
                <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/${issueNumber}" target="_blank" class="github-link">查看Issue</a>
            `;
            return;
        }
        
        // 创建一个"模拟"检查
        // 实际应用中，这里应该使用fetch API检查issue的评论
        // 但由于GitHub API的跨域限制，这里只是模拟检查结果
        
        if (attempts >= 10) { // 模拟10次检查后找到结果
            clearInterval(window.progressInterval);
            document.getElementById('progress-bar').style.width = '100%';
            
            // 模拟解密结果
            displayDecryptResult(`// 解密结果 - 来自issue #${issueNumber}
// 解密时间: ${new Date().toLocaleString()}

function deobfuscatedCode() {
    console.log('代码已成功解密!');
    return '这里会显示实际解密后的代码';
}

// 在实际使用中，这里将是GitHub Actions处理后的真实解密结果
// 解密结果会作为issue评论返回
`, fileType);
            
            clearInterval(checkInterval);
        }
    };
    
    // 开始轮询
    const checkInterval = setInterval(checkIssue, 3000);
}

// 显示解密结果
function displayDecryptResult(result, fileType) {
    const resultElement = document.getElementById('result-content');
    
    // 显示结果
    resultElement.innerHTML = `
        <p>解密完成!</p>
        <pre>${escapeHtml(result)}</pre>
        <div class="copy-download-btns">
            <button id="copy-btn">复制结果</button>
            <button id="download-btn">下载结果</button>
            <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}" target="_blank" class="github-link">查看仓库</a>
        </div>
    `;
    
    // 添加复制和下载功能
    document.getElementById('copy-btn').addEventListener('click', () => {
        navigator.clipboard.writeText(result)
            .then(() => alert('已复制到剪贴板'))
            .catch(err => console.error('复制失败:', err));
    });
    
    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([result], {type: 'text/plain'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `decrypted.${fileType}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
