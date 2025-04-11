// ==== 大型文件处理优化 ====

// 配置
const FILE_SIZE_LIMIT = 20 * 1024 * 1024; // 20MB
const CHUNK_SIZE = 1024 * 1024; // 1MB块大小
let fileChunksManager = {
    chunks: [],
    fileName: '',
    fileType: '',
    totalSize: 0,
    processed: 0,
    content: ''
};

// 修改handleFileUpload函数来处理大型文件
function handleFileUpload(file) {
    if (!file) return;
    
    // 检查文件类型
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['js', 'py', 'php', 'txt'].includes(fileExtension)) {
        alert('不支持的文件类型！只支持 .js, .py, .php, .txt 文件。');
        return;
    }
    
    // 重置文件块管理器
    resetFileChunksManager();
    fileChunksManager.fileName = file.name;
    fileChunksManager.fileType = fileExtension;
    fileChunksManager.totalSize = file.size;
    
    // 设置UI
    const codeInput = document.getElementById('code-input');
    const resultElement = document.getElementById('result-content');
    
    // 隐藏拖放区域（如果存在）
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) {
        dropZone.style.display = 'none';
    }
    
    // 根据文件类型选择相应的单选按钮
    if (['js', 'py', 'php'].includes(fileExtension)) {
        document.querySelector(`input[name="file-type"][value="${fileExtension}"]`).checked = true;
    }
    
    // 跳转到粘贴代码标签页
    document.querySelector('.tab[data-tab="paste"]').click();
    
    // 检查文件大小，决定处理方式
    if (file.size > CHUNK_SIZE) {
        // 大型文件处理
        resultElement.innerHTML = `
            <div class="info-box">
                <p>正在处理大型文件 <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)...</p>
                <div class="progress-container">
                    <div class="progress-bar" id="file-progress-bar" style="width: 0%"></div>
                </div>
            </div>
        `;
        
        // 分块读取文件
        processLargeFile(file);
    } else {
        // 小型文件处理 - 原来的逻辑
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 获取文件内容
            const fileContent = e.target.result;
            
            // 设置文本区域内容
            codeInput.value = fileContent;
            codeInput.style.display = 'block';
            
            // 显示成功消息
            resultElement.innerHTML = `
                <div class="info-box">
                    <p>文件 <strong>${file.name}</strong> 已成功加载，大小: ${(file.size / 1024).toFixed(2)} KB</p>
                    <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
                </div>
            `;
        };
        
        reader.onerror = function() {
            alert('读取文件时出错！');
            console.error('FileReader error:', reader.error);
        };
        
        // 以文本形式读取文件
        reader.readAsText(file);
    }
}

// 重置文件块管理器
function resetFileChunksManager() {
    fileChunksManager.chunks = [];
    fileChunksManager.fileName = '';
    fileChunksManager.fileType = '';
    fileChunksManager.totalSize = 0;
    fileChunksManager.processed = 0;
    fileChunksManager.content = '';
}

// 处理大型文件 - 分块读取
function processLargeFile(file) {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const progressBar = document.getElementById('file-progress-bar');
    
    // 处理完成后的回调
    const onComplete = () => {
        // 更新进度条
        if (progressBar) progressBar.style.width = '100%';
        
        // 组合所有块
        fileChunksManager.content = fileChunksManager.chunks.join('');
        
        // 设置到输入区域，但有大小限制
        const codeInput = document.getElementById('code-input');
        
        // 如果内容太大，只显示部分
        const MAX_DISPLAY_SIZE = 500 * 1024; // 500KB显示限制
        if (fileChunksManager.content.length > MAX_DISPLAY_SIZE) {
            const truncatedContent = fileChunksManager.content.substring(0, MAX_DISPLAY_SIZE);
            codeInput.value = truncatedContent + '\n\n/* 文件太大，只显示前500KB。完整内容将在解密时处理。 */';
        } else {
            codeInput.value = fileChunksManager.content;
        }
        
        codeInput.style.display = 'block';
        
        // 显示成功消息
        document.getElementById('result-content').innerHTML = `
            <div class="info-box">
                <p>大型文件 <strong>${file.name}</strong> 已成功加载，大小: ${(file.size / 1024).toFixed(2)} KB</p>
                <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
                ${fileChunksManager.content.length > MAX_DISPLAY_SIZE ? 
                  '<p><strong>注意:</strong> 由于文件较大，界面上只显示了部分内容。完整内容将在解密时处理。</p>' : ''}
            </div>
        `;
    };
    
    // 读取一个块
    const readNextChunk = (start) => {
        if (start >= file.size) {
            onComplete();
            return;
        }
        
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 存储块内容
            fileChunksManager.chunks.push(e.target.result);
            fileChunksManager.processed += (end - start);
            
            // 更新进度条
            if (progressBar) {
                const progress = (fileChunksManager.processed / file.size) * 100;
                progressBar.style.width = progress + '%';
            }
            
            // 读取下一块
            readNextChunk(end);
        };
        
        reader.onerror = function() {
            alert(`读取文件块时出错！已处理 ${(fileChunksManager.processed / 1024).toFixed(2)}KB/${(file.size / 1024).toFixed(2)}KB`);
            console.error('FileReader error:', reader.error);
        };
        
        reader.readAsText(chunk);
    };
    
    // 开始读取文件
    readNextChunk(0);
}
// ==== GitHub Issue创建优化 ====

// 修改createGitHubIssue函数来处理大型代码
function createGitHubIssue(code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    try {
        // 检查代码大小
        const MAX_ISSUE_SIZE = 65000; // GitHub Issue内容限制约为65KB
        const isLargeCode = code.length > MAX_ISSUE_SIZE;
        
        // 构造Issue标题
        const issueTitle = `[Web解密请求] ${encryptionType}${isLargeCode ? ' [大型文件]' : ''}`;
        
        // 为大型文件准备内容
        let issueBody;
        
        if (isLargeCode) {
            // 大型文件处理 - 只包含文件摘要
            const codeSummary = code.substring(0, 2000) + '...\n[内容过长，已截断]';
            
            issueBody = `# 解密请求 (大型文件)

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**时间戳:** ${new Date().toISOString()}

**代码摘要:**
\`\`\`${fileType}
${codeSummary}
\`\`\`

> 注意：此文件过大，无法直接显示完整内容。请使用下方的分块处理系统或直接联系提交者获取完整代码。`;
        } else {
            // 常规文件 - 原有逻辑
            issueBody = `# 解密请求

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**时间戳:** ${new Date().toISOString()}

**代码:**
\`\`\`${fileType}
${code}
\`\`\``;
        }

        // 在结果区域显示用户友好的表单
        resultElement.innerHTML = `
            <div class="info-box">
                <p><strong>创建解密请求</strong></p>
                <p>我们将为您自动创建一个解密请求。请检查以下信息：</p>
                
                <p><strong>标题:</strong> ${issueTitle}</p>
                <p><strong>文件类型:</strong> ${fileType}</p>
                <p><strong>加密类型:</strong> ${encryptionType}</p>
                <p><strong>代码长度:</strong> ${(code.length / 1024).toFixed(2)}KB ${isLargeCode ? '(超出GitHub Issue限制)' : ''}</p>
                
                <div class="auth-inputs">
                    <input type="text" id="github-username" class="auth-input" placeholder="您的GitHub用户名（可选）">
                    <input type="password" id="github-token" class="auth-input" placeholder="个人访问令牌（可选）">
                </div>
                <p style="font-size: 12px; color: #999;">注意：提供GitHub令牌可以自动创建Issue。如不提供，将引导您手动创建。您的令牌不会被保存。</p>
                
                ${isLargeCode ? `
                <div style="margin: 15px 0; padding: 10px; background: #fff9c4; border-left: 4px solid #ffc107;">
                    <p><strong>大型文件处理选项:</strong></p>
                    <div>
                        <input type="radio" id="method-gist" name="large-file-method" value="gist" checked>
                        <label for="method-gist">创建GitHub Gist并链接到Issue (推荐)</label>
                    </div>
                    <div>
                        <input type="radio" id="method-split" name="large-file-method" value="split">
                        <label for="method-split">拆分为多个Issue</label>
                    </div>
                    <div>
                        <input type="radio" id="method-manual" name="large-file-method" value="manual">
                        <label for="method-manual">手动处理（提供说明）</label>
                    </div>
                </div>
                ` : ''}
                
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
            
            if (isLargeCode) {
                // 获取选择的大型文件处理方法
                const largeFileMethod = document.querySelector('input[name="large-file-method"]:checked').value;
                
                if (token && username) {
                    // 根据选择的方法处理大型文件
                    switch(largeFileMethod) {
                        case 'gist':
                            await handleLargeFileWithGist(code, issueTitle, issueBody, username, token, fileType);
                            break;
                        case 'split':
                            await handleLargeFileWithSplit(code, issueTitle, issueBody, username, token, fileType, encryptionType);
                            break;
                        case 'manual':
                            showLargeFileManualInstructions(issueTitle, code, fileType, encryptionType);
                            break;
                    }
                } else {
                    // 如果没有提供令牌，显示大型文件的手动步骤
                    showLargeFileManualInstructions(issueTitle, code, fileType, encryptionType);
                }
            } else {
                // 常规大小文件的原有逻辑
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
            }
        });
        
        // 添加手动按钮事件
        document.getElementById('show-manual-btn').addEventListener('click', () => {
            if (isLargeCode) {
                showLargeFileManualInstructions(issueTitle, code, fileType, encryptionType);
            } else {
                showManualSteps(issueTitle, issueBody, fileType);
            }
        });
    } catch (error) {
        resultElement.innerHTML = `
            <p>错误: ${error.message}</p>
            <p>请稍后重试。</p>
        `;
    }
}
// ==== 大型文件处理方法(续) ====

    } catch (error) {
        console.error('拆分大型文件失败:', error);
        resultElement.innerHTML = `
            <p>自动拆分大型文件失败: ${error.message}</p>
            <p>请尝试使用Gist方法或手动方法。</p>
            <button id="show-manual-large" class="github-link">显示手动步骤</button>
        `;
        
        document.getElementById('show-manual-large').addEventListener('click', () => {
            showLargeFileManualInstructions(issueTitle, code, fileType);
        });
    }
}

// 显示大型文件手动处理说明
function showLargeFileManualInstructions(issueTitle, code, fileType, encryptionType) {
    const resultElement = document.getElementById('result-content');
    
    resultElement.innerHTML = `
        <div class="info-box">
            <h3>处理大型文件的手动步骤</h3>
            <p>此文件太大，超出了GitHub Issue的大小限制。以下是手动处理的步骤：</p>
            
            <div class="manual-options">
                <div class="manual-option">
                    <h4>选项1: 使用GitHub Gist (推荐)</h4>
                    <ol>
                        <li>访问 <a href="https://gist.github.com/" target="_blank">GitHub Gist</a></li>
                        <li>创建一个新的私有Gist，包含您的完整代码</li>
                        <li>复制Gist的URL</li>
                        <li>创建一个新的Issue: <a href="https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new" target="_blank">创建Issue</a></li>
                        <li>使用标题: <code>${issueTitle}</code></li>
                        <li>在Issue内容中，包含以下信息:</li>
                    </ol>
                    <div class="code-template">
                        <pre># 解密请求 (大型文件)

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**时间戳:** ${new Date().toISOString()}

完整代码可在此Gist中查看: [您的Gist URL]</pre>
                        <button id="copy-gist-template-btn" class="secondary-btn">复制模板</button>
                    </div>
                </div>
                
                <div class="manual-option">
                    <h4>选项2: 分割文件</h4>
                    <p>将大型文件分割成多个部分，每个部分创建一个Issue。</p>
                    <button id="download-split-btn" class="primary-btn">下载已分割的文件</button>
                    <p class="small-text">将下载一个ZIP文件，包含分割后的文件和说明。</p>
                </div>
                
                <div class="manual-option">
                    <h4>选项3: 使用其他服务</h4>
                    <p>将您的代码上传到其他支持大型文件的服务，如:</p>
                    <ul>
                        <li><a href="https://pastebin.com/" target="_blank">Pastebin</a></li>
                        <li><a href="https://codepen.io/" target="_blank">CodePen</a></li>
                        <li>Google Drive / Dropbox 共享链接</li>
                    </ul>
                    <p>然后在Issue中提供链接。</p>
                </div>
            </div>
            
            <button id="back-to-main-btn" class="github-link">返回</button>
        </div>
    `;
    
    // 复制Gist模板按钮事件
    document.getElementById('copy-gist-template-btn').addEventListener('click', () => {
        const template = `# 解密请求 (大型文件)

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**时间戳:** ${new Date().toISOString()}

完整代码可在此Gist中查看: [您的Gist URL]`;

        navigator.clipboard.writeText(template)
            .then(() => {
                alert('模板已复制到剪贴板！');
            })
            .catch(err => {
                console.error('复制失败:', err);
                alert('复制失败，请手动复制模板。');
            });
    });
    
    // 下载分割文件按钮事件
    document.getElementById('download-split-btn').addEventListener('click', () => {
        prepareSplitFilesForDownload(code, fileType, encryptionType);
    });
    
    // 返回按钮事件
    document.getElementById('back-to-main-btn').addEventListener('click', () => {
        createGitHubIssue(code, fileType, encryptionType);
    });
}

// 准备分割文件下载
async function prepareSplitFilesForDownload(code, fileType, encryptionType) {
    try {
        const CHUNK_SIZE = 60000; // 每个部分约60KB
        const totalChunks = Math.ceil(code.length / CHUNK_SIZE);
        const files = [];
        
        // 创建README文件
        files.push({
            name: 'README.md',
            content: `# 分割的大型脚本文件

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**分割数量:** ${totalChunks}个部分
**创建时间:** ${new Date().toISOString()}

## 使用说明

1. 在GitHub上创建一个主Issue，使用标题: \`[Web解密请求] ${encryptionType} [大型文件]\`
2. 在Issue内容中包含以下信息:

\`\`\`
# 解密请求 (拆分的大型文件)

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**拆分数量:** ${totalChunks}个部分

此大型文件已被拆分为${totalChunks}个部分，将分别提交。
\`\`\`

3. 为每个部分文件创建单独的Issue，链接到主Issue。

## 文件部分

${Array.from({length: totalChunks}, (_, i) => `- part_${i+1}_of_${totalChunks}.${fileType} - 字符 ${i*CHUNK_SIZE}-${Math.min((i+1)*CHUNK_SIZE, code.length)}`).join('\n')}
`
        });
        
        // 创建每个部分文件
        for (let i = 0; i < totalChunks; i++) {
            const start = i * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, code.length);
            const codeChunk = code.substring(start, end);
            
            files.push({
                name: `part_${i+1}_of_${totalChunks}.${fileType}`,
                content: codeChunk
            });
        }
        
        // 创建指导文档
        files.push({
            name: 'INSTRUCTIONS.md',
            content: `# 如何提交分割的脚本文件

## 步骤1: 创建主Issue

1. 访问 [${repoConfig.owner}/${repoConfig.repo} Issues](https://github.com/${repoConfig.owner}/${repoConfig.repo}/issues/new)
2. 使用标题: \`[Web解密请求] ${encryptionType} [大型文件]\`
3. 在Issue内容中包含以下信息:

\`\`\`
# 解密请求 (拆分的大型文件)

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**文件大小:** ${(code.length / 1024).toFixed(2)}KB
**拆分数量:** ${totalChunks}个部分

此大型文件已被拆分为${totalChunks}个部分，将分别提交。
\`\`\`

4. 提交Issue并记下Issue编号(例如: #123)

## 步骤2: 创建每个部分的Issue

对于每个部分文件 (part_1_of_${totalChunks}.${fileType} 到 part_${totalChunks}_of_${totalChunks}.${fileType})：

1. 创建新的Issue
2. 使用标题: \`[Web解密请求] ${encryptionType} [部分 X/${totalChunks}]\`
3. 在Issue内容中包含以下信息:

\`\`\`
# 解密请求 (部分 X/${totalChunks})

**文件类型:** \`${fileType}\`
**加密类型:** \`${encryptionType}\`
**主Issue:** #XXX (替换为主Issue编号)
**部分范围:** 部分 X/${totalChunks}

**代码部分:**
\`\`\`${fileType}
(在这里粘贴此部分的代码)
\`\`\`
\`\`\`

## 步骤3: 更新主Issue

当所有部分都已提交后，编辑主Issue并添加所有部分Issue的链接。
`
        });
        
        // 使用JSZip创建ZIP文件
        // 注意：JSZip需要从CDN加载
        await loadJSZip();
        
        const zip = new JSZip();
        
        // 添加所有文件到ZIP
        files.forEach(file => {
            zip.file(file.name, file.content);
        });
        
        // 生成ZIP并下载
        const zipContent = await zip.generateAsync({type: 'blob'});
        const zipUrl = URL.createObjectURL(zipContent);
        
        const downloadLink = document.createElement('a');
        downloadLink.href = zipUrl;
        downloadLink.download = `split_script_${new Date().getTime()}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        
        // 清理
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(zipUrl);
        }, 100);
        
    } catch (error) {
        console.error('准备分割文件下载失败:', error);
        alert(`准备分割文件失败: ${error.message}`);
    }
}

// 动态加载JSZip库
async function loadJSZip() {
    return new Promise((resolve, reject) => {
        // 检查JSZip是否已加载
        if (window.JSZip) {
            resolve();
            return;
        }
        
        // 创建script标签
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.integrity = 'sha512-XMVd28F1oH/O71fzwBnV7HucLxVwtxf26XV8P4wPk26EDxuGZ91N8bsOttmnomcCD3CS5ZMRL50H0GgOHvegtg==';
        script.crossOrigin = 'anonymous';
        script.referrerPolicy = 'no-referrer';
        
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('加载JSZip库失败'));
        
        document.head.appendChild(script);
    });
}
// ==== 主要脚本修改 ====

// 修改解码按钮点击事件
function initButtons() {
    // 清空按钮点击事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.getElementById('code-input').value = '';
            document.getElementById('result-content').innerHTML = '';
            
            // 重置文件块管理器
            resetFileChunksManager();
            
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
            // 检查是否有从文件管理器加载的大型文件
            let code;
            if (fileChunksManager.content && fileChunksManager.content.length > 0) {
                code = fileChunksManager.content;
            } else {
                code = document.getElementById('code-input').value;
            }
            
            if (!code || !code.trim()) {
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
            
            // 如果使用了文件块管理器，优先使用其记录的文件类型
            if (fileChunksManager.fileType) {
                fileType = fileChunksManager.fileType;
                // 确保UI上的选择匹配
                const typeRadio = document.querySelector(`input[name="file-type"][value="${fileType}"]`);
                if (typeRadio) typeRadio.checked = true;
            }
            
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

// 添加CSS样式
function addLargeFileStyles() {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
        /* 进度条样式 */
        .progress-container {
            width: 100%;
            background-color: #f1f1f1;
            border-radius: 4px;
            margin: 10px 0;
            overflow: hidden;
        }
        
        .progress-bar {
            height: 20px;
            width: 0%;
            background-color: #4CAF50;
            text-align: center;
            line-height: 20px;
            color: white;
            transition: width 0.3s;
            border-radius: 4px;
        }
        
        /* 大型文件处理选项 */
        .manual-options {
            display: flex;
            flex-direction: column;
            gap: 20px;
            margin: 20px 0;
        }
        
        .manual-option {
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 15px;
            background-color: #f6f8fa;
        }
        
        .manual-option h4 {
            margin-top: 0;
            color: #24292e;
            border-bottom: 1px solid #e1e4e8;
            padding-bottom: 8px;
        }
        
        .code-template {
            background-color: #f6f8fa;
            border: 1px solid #e1e4e8;
            border-radius: 6px;
            padding: 10px;
            margin: 10px 0;
            overflow: auto;
            max-height: 200px;
        }
        
        .code-template pre {
            margin: 0;
            overflow-x: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .small-text {
            font-size: 12px;
            color: #666;
        }
        
        /* 按钮样式 */
        .primary-btn, .secondary-btn, .github-link {
            cursor: pointer;
            display: inline-block;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 500;
            text-align: center;
            transition: 0.2s;
            margin: 5px 0;
        }
        
        .primary-btn {
            background-color: #2ea44f;
            color: white;
            border: 1px solid rgba(27, 31, 35, 0.15);
        }
        
        .primary-btn:hover {
            background-color: #2c974b;
        }
        
        .secondary-btn {
            background-color: #fafbfc;
            color: #24292e;
            border: 1px solid rgba(27, 31, 35, 0.15);
        }
        
        .secondary-btn:hover {
            background-color: #f3f4f6;
        }
        
        .github-link {
            color: #0366d6;
            background: none;
            border: none;
            text-decoration: underline;
        }
        
        .github-link:hover {
            color: #0a5999;
            text-decoration: underline;
        }
        
        /* 信息框样式 */
        .info-box {
            background-color: #f6f8fa;
            border-left: 4px solid #0366d6;
            border-radius: 3px;
            padding: 12px;
            margin: 15px 0;
        }
        
        /* 文件太大警告 */
        .file-too-large-warning {
            color: #721c24;
            background-color: #f8d7da;
            border-left: 4px solid #f5c6cb;
            padding: 10px;
            margin: 10px 0;
            border-radius: 3px;
        }
    `;
    
    document.head.appendChild(styleEl);
}

// 初始化增强功能
function initEnhancedFeatures() {
    // 添加样式
    addLargeFileStyles();
    
    // 添加页面加载完成事件，显示指示大型文件支持的信息
    const pasteContentEl = document.getElementById('paste-content');
    if (pasteContentEl) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'info-box';
        infoDiv.style.margin = '10px 0';
        infoDiv.innerHTML = `
            <p><strong>✅ 增强版本</strong> - 支持处理大型脚本文件 (最大支持20MB)</p>
            <p>大型文件将被分块处理，确保安全高效地提交解密请求。</p>
        `;
        
        // 在拖放区域下方插入信息
        const dropZone = document.querySelector('.drop-zone');
        if (dropZone && dropZone.parentNode) {
            dropZone.parentNode.insertBefore(infoDiv, dropZone.nextSibling);
        } else {
            pasteContentEl.insertBefore(infoDiv, pasteContentEl.firstChild);
        }
    }
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 原来的初始化代码
    initTabs();
    initButtons();
    initFileUpload();
    initRemoteFile();
    initDragDrop();
    
    // 新增的增强功能初始化
    initEnhancedFeatures();
});
