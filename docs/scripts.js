// ===== 大型文件处理 - 第1部分：基础配置和样式 =====

// 添加大型文件处理的配置
const largeFile = {
    // 配置
    SIZE_LIMIT: 20 * 1024 * 1024, // 20MB
    CHUNK_SIZE: 1024 * 1024, // 1MB块大小
    DISPLAY_LIMIT: 500 * 1024, // 界面显示限制（500KB）
    
    // 状态
    manager: {
        chunks: [],
        fileName: '',
        fileType: '',
        totalSize: 0,
        processed: 0,
        content: ''
    },
    
    // 重置管理器
    resetManager: function() {
        this.manager.chunks = [];
        this.manager.fileName = '';
        this.manager.fileType = '';
        this.manager.totalSize = 0;
        this.manager.processed = 0;
        this.manager.content = '';
    }
};

// 添加样式
function addLargeFileStyles() {
    // 避免重复添加
    if (document.getElementById('large-file-styles')) return;
    
    const styleEl = document.createElement('style');
    styleEl.id = 'large-file-styles';
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
        }
        
        /* 大型文件信息框 */
        .large-file-info {
            margin: 10px 0;
            padding: 10px;
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            border-radius: 4px;
        }
    `;
    
    document.head.appendChild(styleEl);
}

// 初始化样式 (在页面加载后调用)
document.addEventListener('DOMContentLoaded', function() {
    // 延迟执行以确保不干扰原始脚本
    setTimeout(function() {
        addLargeFileStyles();
        console.log('大型文件处理样式已加载');
    }, 300);
});
// ===== 大型文件处理 - 第2部分：文件处理函数 =====

// 处理大型文件上传
function handleLargeFileUpload(file) {
    if (!file) return false;
    
    // 检查文件大小，如果不是大文件则返回false让原始函数处理
    if (file.size <= largeFile.CHUNK_SIZE) {
        return false;
    }
    
    console.log('检测到大型文件:', file.name, '大小:', file.size);
    
    // 获取文件扩展名
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // 重置管理器
    largeFile.resetManager();
    largeFile.manager.fileName = file.name;
    largeFile.manager.fileType = fileExtension;
    largeFile.manager.totalSize = file.size;
    
    // 准备UI
    const codeInput = document.getElementById('code-input');
    const resultElement = document.getElementById('result-content');
    
    // 切换到粘贴标签页
    const pasteTab = document.querySelector('.tab[data-tab="paste"]');
    if (pasteTab) pasteTab.click();
    
    // 隐藏拖放区域
    const dropZone = document.querySelector('.drop-zone');
    if (dropZone) dropZone.style.display = 'none';
    
    // 显示处理信息
    if (resultElement) {
        resultElement.innerHTML = `
            <div class="large-file-info">
                <p>正在处理大型文件 <strong>${file.name}</strong> (${(file.size / 1024).toFixed(2)} KB)...</p>
                <div class="progress-container">
                    <div class="progress-bar" id="file-progress-bar" style="width: 0%"></div>
                </div>
            </div>
        `;
    }
    
    // 分块读取文件
    processLargeFile(file);
    return true; // 表示已处理
}

// 分块处理大型文件
function processLargeFile(file) {
    const totalChunks = Math.ceil(file.size / largeFile.CHUNK_SIZE);
    const progressBar = document.getElementById('file-progress-bar');
    
    // 处理完成后的回调
    const onComplete = () => {
        // 更新进度条
        if (progressBar) progressBar.style.width = '100%';
        
        // 组合所有块
        largeFile.manager.content = largeFile.manager.chunks.join('');
        
        // 设置到输入区域，但有大小限制
        const codeInput = document.getElementById('code-input');
        if (!codeInput) return;
        
        // 如果内容太大，只显示部分
        if (largeFile.manager.content.length > largeFile.DISPLAY_LIMIT) {
            const truncatedContent = largeFile.manager.content.substring(0, largeFile.DISPLAY_LIMIT);
            codeInput.value = truncatedContent + '\n\n/* 文件太大，只显示前500KB。完整内容将在解密时处理。 */';
        } else {
            codeInput.value = largeFile.manager.content;
        }
        
        codeInput.style.display = 'block';
        
        // 显示成功消息
        const resultElement = document.getElementById('result-content');
        if (resultElement) {
            resultElement.innerHTML = `
                <div class="large-file-info">
                    <p>大型文件 <strong>${file.name}</strong> 已成功加载，大小: ${(file.size / 1024).toFixed(2)} KB</p>
                    <p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>
                    ${largeFile.manager.content.length > largeFile.DISPLAY_LIMIT ? 
                    '<p><strong>注意:</strong> 由于文件较大，界面上只显示了部分内容。完整内容将在解密时处理。</p>' : ''}
                </div>
            `;
        }
    };
    
    // 读取一个块
    const readNextChunk = (start) => {
        if (start >= file.size) {
            onComplete();
            return;
        }
        
        const end = Math.min(start + largeFile.CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // 存储块内容
            largeFile.manager.chunks.push(e.target.result);
            largeFile.manager.processed += (end - start);
            
            // 更新进度条
            if (progressBar) {
                const progress = (largeFile.manager.processed / file.size) * 100;
                progressBar.style.width = progress + '%';
            }
            
            // 读取下一块
            readNextChunk(end);
        };
        
        reader.onerror = function() {
            alert(`读取文件块时出错！已处理 ${(largeFile.manager.processed / 1024).toFixed(2)}KB/${(file.size / 1024).toFixed(2)}KB`);
            console.error('FileReader error:', reader.error);
        };
        
        reader.readAsText(chunk);
    };
    
    // 开始读取文件
    readNextChunk(0);
}
// ===== 大型文件处理 - 第3部分：集成到原有功能 =====

// 安全集成到现有代码
document.addEventListener('DOMContentLoaded', function() {
    // 确保在原始代码初始化后运行
    setTimeout(function() {
        // 增强文件上传功能
        enhanceFileUpload();
        
        // 增强解密按钮
        enhanceDecryptButton();
        
        console.log('大型文件处理功能已集成');
    }, 500);
});

// 增强文件上传功能
function enhanceFileUpload() {
    // 保存原始的handleFileUpload函数
    const originalHandleFileUpload = window.handleFileUpload;
    
    // 确保原始函数存在
    if (typeof originalHandleFileUpload !== 'function') {
        console.warn('原始handleFileUpload函数未找到');
        return;
    }
    
    // 替换为增强版本
    window.handleFileUpload = function(file) {
        // 先尝试用增强版处理大型文件
        const isLargeFile = handleLargeFileUpload(file);
        
        // 如果不是大型文件，使用原始函数处理
        if (!isLargeFile) {
            originalHandleFileUpload(file);
        }
    };
    
    console.log('文件上传功能已增强');
}

// 增强解密按钮
function enhanceDecryptButton() {
    const decryptBtn = document.getElementById('decrypt-btn');
    if (!decryptBtn) {
        console.warn('解密按钮未找到');
        return;
    }
    
    // 保存原始的点击事件处理器
    const originalClickListeners = [...decryptBtn.listeners];
    
    // 移除现有的所有点击事件
    decryptBtn.removeEventListener('click');
    
    // 添加新的点击事件处理器
    decryptBtn.addEventListener('click', function() {
        // 检查是否有大型文件
        if (largeFile.manager.content && largeFile.manager.content.length > 0) {
            // 获取文件类型
            let fileType = largeFile.manager.fileType || 'js';
            
            // 确保UI上的选择匹配
            const typeRadio = document.querySelector(`input[name="file-type"][value="${fileType}"]`);
            if (typeRadio) typeRadio.checked = true;
            
            // 获取选中的加密类型
            let encryptionType = 'auto';
            document.querySelectorAll('input[name="encryption-type"]').forEach(input => {
                if (input.checked) {
                    encryptionType = input.id.replace('type-', '');
                }
            });
            
            // 使用完整内容创建GitHub issue
            console.log('使用大型文件内容创建解密请求...');
            createGitHubIssue(largeFile.manager.content, fileType, encryptionType);
            
            // 防止原始事件处理器执行
            return;
        }
        
        // 如果没有大型文件，执行所有原始监听器
        for (const listener of originalClickListeners) {
            listener.call(decryptBtn);
        }
    });
    
    console.log('解密按钮功能已增强');
}

// 修复：保存按钮的原始事件监听器
(function saveOriginalListeners() {
    // 为所有元素添加listeners数组
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (!this.listeners) {
            this.listeners = [];
        }
        
        // 保存事件监听器
        if (type === 'click') {
            this.listeners.push(listener);
        }
        
        // 调用原始方法
        originalAddEventListener.call(this, type, listener, options);
    };
    
    // 扩展removeEventListener
    const originalRemoveEventListener = EventTarget.prototype.removeEventListener;
    EventTarget.prototype.removeEventListener = function(type) {
        if (type && !arguments[1]) {
            // 如果只提供了类型，移除该类型的所有监听器
            if (this.listeners) {
                this.listeners = this.listeners.filter(listener => 
                    listener._eventType !== type);
            }
            
            // 原始方法无法只通过类型移除，不执行
            return;
        }
        
        // 调用原始方法
        originalRemoveEventListener.apply(this, arguments);
    };
})();
