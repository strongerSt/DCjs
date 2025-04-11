// ===== 大型文件处理 - 精简完整版 =====

// 添加大型文件处理的配置
var largeFile = {
    CHUNK_SIZE: 1024 * 1024, // 1MB块大小
    DISPLAY_LIMIT: 500 * 1024, // 界面显示限制（500KB）
    
    // 状态管理
    manager: {
        chunks: [],
        fileName: '',
        fileType: '',
        totalSize: 0,
        processed: 0,
        content: ''
    }
};

// 重置管理器函数
function resetLargeFileManager() {
    largeFile.manager.chunks = [];
    largeFile.manager.fileName = '';
    largeFile.manager.fileType = '';
    largeFile.manager.totalSize = 0;
    largeFile.manager.processed = 0;
    largeFile.manager.content = '';
}

// 添加样式
function addLargeFileStyles() {
    var styleEl = document.createElement('style');
    styleEl.id = 'large-file-styles';
    styleEl.textContent = '.progress-container{width:100%;background-color:#f1f1f1;border-radius:4px;margin:10px 0;overflow:hidden}.progress-bar{height:20px;width:0%;background-color:#4CAF50;text-align:center;line-height:20px;color:white}.large-file-info{margin:10px 0;padding:10px;background-color:#e3f2fd;border-left:4px solid #2196f3;border-radius:4px}';
    document.head.appendChild(styleEl);
}

// 处理大型文件上传
function handleLargeFileUpload(file) {
    if (!file || file.size <= largeFile.CHUNK_SIZE) return false;
    
    console.log('检测到大型文件:', file.name, '大小:', file.size);
    
    // 获取文件扩展名
    var fileExtension = file.name.split('.').pop().toLowerCase();
    
    // 重置管理器
    resetLargeFileManager();
    largeFile.manager.fileName = file.name;
    largeFile.manager.fileType = fileExtension;
    largeFile.manager.totalSize = file.size;
    
    // 准备UI
    var codeInput = document.getElementById('code-input');
    var resultElement = document.getElementById('result-content');
    
    // 切换到粘贴标签页
    var pasteTab = document.querySelector('.tab[data-tab="paste"]');
    if (pasteTab) pasteTab.click();
    
    // 隐藏拖放区域
    var dropZone = document.querySelector('.drop-zone');
    if (dropZone) dropZone.style.display = 'none';
    
    // 显示处理信息
    if (resultElement) {
        resultElement.innerHTML = 
            '<div class="large-file-info">' +
            '<p>正在处理大型文件 <strong>' + file.name + '</strong> (' + (file.size / 1024).toFixed(2) + ' KB)...</p>' +
            '<div class="progress-container">' +
            '<div class="progress-bar" id="file-progress-bar" style="width: 0%"></div>' +
            '</div></div>';
    }
    
    // 分块读取文件
    processLargeFile(file);
    return true; // 表示已处理
}

// 分块处理大型文件
function processLargeFile(file) {
    var totalChunks = Math.ceil(file.size / largeFile.CHUNK_SIZE);
    var progressBar = document.getElementById('file-progress-bar');
    
    // 读取一个块
    function readNextChunk(start) {
        if (start >= file.size) {
            onComplete();
            return;
        }
        
        var end = Math.min(start + largeFile.CHUNK_SIZE, file.size);
        var chunk = file.slice(start, end);
        var reader = new FileReader();
        
        reader.onload = function(e) {
            // 存储块内容
            largeFile.manager.chunks.push(e.target.result);
            largeFile.manager.processed += (end - start);
            
            // 更新进度条
            if (progressBar) {
                var progress = (largeFile.manager.processed / file.size) * 100;
                progressBar.style.width = progress + '%';
            }
            
            // 读取下一块
            readNextChunk(end);
        };
        
        reader.onerror = function() {
            alert('读取文件块时出错！已处理 ' + (largeFile.manager.processed / 1024).toFixed(2) + 'KB/' + (file.size / 1024).toFixed(2) + 'KB');
        };
        
        reader.readAsText(chunk);
    }
    
    // 处理完成后的回调
    function onComplete() {
        // 更新进度条
        if (progressBar) progressBar.style.width = '100%';
        
        // 组合所有块
        largeFile.manager.content = largeFile.manager.chunks.join('');
        
        // 设置到输入区域，但有大小限制
        var codeInput = document.getElementById('code-input');
        if (!codeInput) return;
        
        // 如果内容太大，只显示部分
        if (largeFile.manager.content.length > largeFile.DISPLAY_LIMIT) {
            var truncatedContent = largeFile.manager.content.substring(0, largeFile.DISPLAY_LIMIT);
            codeInput.value = truncatedContent + '\n\n/* 文件太大，只显示前500KB。完整内容将在解密时处理。 */';
        } else {
            codeInput.value = largeFile.manager.content;
        }
        
        codeInput.style.display = 'block';
        
        // 显示成功消息
        var resultElement = document.getElementById('result-content');
        if (resultElement) {
            var notice = '';
            if (largeFile.manager.content.length > largeFile.DISPLAY_LIMIT) {
                notice = '<p><strong>注意:</strong> 由于文件较大，界面上只显示了部分内容。完整内容将在解密时处理。</p>';
            }
            
            resultElement.innerHTML = 
                '<div class="large-file-info">' +
                '<p>大型文件 <strong>' + file.name + '</strong> 已成功加载，大小: ' + (file.size / 1024).toFixed(2) + ' KB</p>' +
                '<p>您现在可以选择解密类型并点击"点击解码"按钮进行解密。</p>' +
                notice +
                '</div>';
        }
    }
    
    // 开始读取文件
    readNextChunk(0);
}

// 增强文件上传功能
function enhanceFileUpload() {
    // 保存原始的handleFileUpload函数
    var originalHandleFileUpload = window.handleFileUpload;
    
    // 确保原始函数存在
    if (typeof originalHandleFileUpload !== 'function') {
        console.warn('原始handleFileUpload函数未找到');
        return;
    }
    
    // 替换为增强版本
    window.handleFileUpload = function(file) {
        // 先尝试用增强版处理大型文件
        var isLargeFile = handleLargeFileUpload(file);
        
        // 如果不是大型文件，使用原始函数处理
        if (!isLargeFile) {
            originalHandleFileUpload(file);
        }
    };
}

// 增强解密按钮
function enhanceDecryptButton() {
    var decryptBtn = document.getElementById('decrypt-btn');
    if (!decryptBtn) {
        console.warn('解密按钮未找到');
        return;
    }
    
    // 保存原始onclick事件
    var originalOnClick = decryptBtn.onclick;
    
    // 设置新的onclick事件
    decryptBtn.onclick = function(event) {
        // 检查是否有大型文件
        if (largeFile.manager.content && largeFile.manager.content.length > 0) {
            // 获取文件类型
            var fileType = largeFile.manager.fileType || 'js';
            
            // 确保UI上的选择匹配
            var typeRadio = document.querySelector('input[name="file-type"][value="' + fileType + '"]');
            if (typeRadio) typeRadio.checked = true;
            
            // 获取选中的加密类型
            var encryptionType = 'auto';
            var encryptionInputs = document.querySelectorAll('input[name="encryption-type"]');
            for (var i = 0; i < encryptionInputs.length; i++) {
                if (encryptionInputs[i].checked) {
                    encryptionType = encryptionInputs[i].id.replace('type-', '');
                    break;
                }
            }
            
            // 使用完整内容创建GitHub issue
            console.log('使用大型文件内容创建解密请求...');
            createGitHubIssue(largeFile.manager.content, fileType, encryptionType);
            
            // 防止原始事件处理器执行
            event.preventDefault();
            return false;
        }
        
        // 如果没有大型文件，执行原始点击事件
        if (originalOnClick) {
            return originalOnClick.call(this, event);
        }
    };
}

// 初始化增强功能
setTimeout(function() {
    console.log('正在初始化大型文件处理功能...');
    addLargeFileStyles();
    enhanceFileUpload();
    enhanceDecryptButton();
    console.log('大型文件处理功能初始化完成');
}, 1000);
